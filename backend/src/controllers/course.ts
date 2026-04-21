import { Request, Response } from "express";
import Razorpay from "razorpay";
import prisma from "../prisma";
import { extractSubdomain } from "../helper/subdomainHelper";
import { CreateFolderSchema } from "../zod/validator";
import {
  s3Client,
  uploadVideo,
  deleteFile,
  deleteMultipleFiles,
} from "../helper/aws";
import {
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";
import path from "path";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CustomRequest extends Request {
  studentId?: string;
  courseId?: string;
  orderId?: string;
}

// Get all courses
export const AllCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      res.status(400).json({ message: "Invalid subdomain" });
      return;
    }

    const instructor = await prisma.instructor.findUnique({
      where: {
        slug: subdomain,
      },
    });

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructor.id,
      },
    });

    if (!courses) {
      res.status(404).json({ message: "No courses found" });
      return;
    }

    res.status(200).json({
      message: "Courses fetched successfully",
      courses,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error while fetching courses" });
  }
};

// Get a single course
export const GetCourse = async (req: Request, res: Response): Promise<void> => {
  const courseId = req.params.id;

  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      // Include folders and their contents so students can browse course material
      include: {
        courseFolders: {
          include: {
            courseContents: true,
          },
        },
      },
    });

    if (!course) {
      res.status(400).json({
        message: "Course not found!",
      });
      return;
    }

    res.status(200).json({
      message: "Course fetched successfully!",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong!",
    });
    return;
  }
};

// Delete a course folder and all its S3 files, then cascade-delete DB rows
export const DeleteFolder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { folderId } = req.params;

  try {
    // Fetch folder with its contents so we can delete S3 files
    const folder = await prisma.courseFolder.findUnique({
      where: { id: folderId },
      include: {
        course: true,
        courseContents: true, // need URLs to delete from S3
      },
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found!" });
      return;
    }

    if (folder.course.instructorId !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Batch-delete all content files from S3 in one API call
    const fileUrls = folder.courseContents.map((c) => c.url);
    await deleteMultipleFiles(fileUrls);

    // Prisma cascade (onDelete: Cascade) removes courseContent rows automatically
    await prisma.courseFolder.delete({ where: { id: folderId } });

    res.status(200).json({
      message: `Folder deleted with ${fileUrls.length} file(s) removed from storage.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Delete a single course content item (video or notes)
export const DeleteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { contentId } = req.params;

  try {
    // Ensure the content belongs to a course owned by this instructor
    const content = await prisma.courseContent.findUnique({
      where: { id: contentId },
      include: {
        courseFolder: {
          include: { course: true },
        },
      },
    });

    if (!content) {
      res.status(404).json({ message: "Content not found!" });
      return;
    }

    if (content.courseFolder.course.instructorId !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Delete the file from S3 first, then remove the DB record.
    // deleteFile is fire-and-forget safe — it won't throw if S3 cleanup fails.
    await deleteFile(content.url);

    await prisma.courseContent.delete({ where: { id: contentId } });

    res.status(200).json({ message: "Content deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Reorder content items within a folder.
// Accepts an ordered array of contentIds; assigns position = array index.
export const ReorderContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { folderId } = req.params;
  const { orderedIds }: { orderedIds: string[] } = req.body;

  if (!Array.isArray(orderedIds) || !orderedIds.length) {
    res.status(400).json({ message: "orderedIds must be a non-empty array" });
    return;
  }

  try {
    // Verify the folder belongs to this instructor
    const folder = await prisma.courseFolder.findUnique({
      where: { id: folderId },
      include: { course: true },
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found!" });
      return;
    }

    if (folder.course.instructorId !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Update each item's position in a single transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.courseContent.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    res.status(200).json({ message: "Content reordered successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Create a folder
export const CreateFolder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parsedData = CreateFolderSchema.safeParse(req.body);
    const { courseId } = req.params;

    if (!parsedData.success) {
      res.status(411).json({ msg: "Invalid inputs" });
      return;
    }

    if (!req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const instructor = await prisma.instructor.findUnique({
      where: {
        id: req.instructorId,
      },
    });

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    // Ensure the specific course exists and belongs to this instructor
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        instructorId: instructor.id,
      },
    });

    if (!course) {
      res.status(404).json({ message: "Course not found or unauthorized" });
      return;
    }

    const folderPresent = await prisma.courseFolder.findFirst({
      where: {
        courseId,
        name: parsedData.data.name,
      },
    });

    if (folderPresent) {
      res.status(400).json({
        message: "Folder with similar name already exists",
      });
      return;
    }

    const folder = await prisma.courseFolder.create({
      data: {
        name: parsedData.data.name,
        courseId: courseId,
      },
    });

    res.json({ message: "Folder created successfully", folder });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Upload video
export const UploadVideo = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, type, courseId, folderId } = req.body;
    const video = req.file;

    if (!video) {
      res.status(400).json({ message: "No video found" });
      return;
    }

    if (!courseId || !folderId) {
      res.status(400).json({ message: "Missing courseId or folderId" });
      return;
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const folder = await prisma.courseFolder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    // Determine the correct MIME type so S3 serves the file correctly in browsers
    const mimeType =
      type === "NOTES" ? "application/pdf" : video.mimetype || "video/mp4";

    const result = await uploadVideo(
      req.instructorId!,
      courseId,
      folder.name,
      video.buffer,
      name,
      mimeType,
    );

    const videoEntry = await prisma.courseContent.create({
      data: {
        name: name,
        url: result.videoUrl,
        type: type,
        courseFolderId: folderId,
      },
    });

    res.status(200).json({
      message: "Video uploaded successfully",
      video: videoEntry,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// List folder contents
export const ListFolderContents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { courseId, folderName } = req.params;
    // const { folderName } = req.query;

    const sanitizedFolderName = path
      .normalize(folderName)
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const prefix = `${req.instructorId}/${courseId}/${sanitizedFolderName}`;

    const params: ListObjectsV2CommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: prefix,
      Delimiter: "/",
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    const folders = (data.CommonPrefixes || []).map(
      (prefix) => prefix.Prefix!.split("/").slice(-2)[0],
    );

    const files = (data.Contents || [])
      .map((item) => ({
        name: item.Key!.split("/").pop() || "",
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      }))
      .filter((item) => item.name);

    res.status(200).json({
      folders,
      files,
      path: prefix,
    });
  } catch (error) {
    console.error("Error listing folder contents:", error);
    throw new Error(
      `Failed to list folder contents: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

// Purchase Course
export const EnrollInCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      res.status(400).json({ message: "Invalid subdomain" });
      return;
    }

    const instructor = await prisma.instructor.findUnique({
      where: {
        slug: subdomain,
      },
    });

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    const course = await prisma.course.findUnique({
      where: {
        id: req.params.courseId,
      },
    });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const student = await prisma.student.findUnique({
      where: {
        id: req.studentId,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const order = await razorpay.orders.create({
      amount: course.price * 100,
      currency: "INR",
      receipt: `receipt_${course.id}`,
    });

    if (!order) {
      res.status(400).json({ message: "Error while creating order" });
      return;
    }

    req.courseId = course.id;
    req.orderId = order.id;

    res.status(200).json({
      success: true,
      courseId: course.id,
      order,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const CapturePayment = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    console.log("BODY:", req.body);
    console.log("studentId:", req.studentId);
    console.log("courseId:", courseId);

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !courseId
    ) {
      res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
      return;
    }

    if (!req.studentId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
      return;
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (!payment) {
      res.status(400).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    if (payment.status === "authorized") {
      await razorpay.payments.capture(
        razorpay_payment_id,
        payment.amount,
        payment.currency,
      );
    } else if (payment.status !== "captured") {
      res.status(400).json({
        success: false,
        message: "Invalid payment status",
        status: payment.status,
      });
      return;
    }

    // Transaction: check for existing enrollment and create atomically.
    // Prevents duplicate enrollments even if two requests arrive at the same time.
    const enrollment = await prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findFirst({
        where: {
          studentId: req.studentId!,
          courseId: courseId,
        },
      });

      if (existing) return existing;

      return await tx.enrollment.create({
        data: {
          studentId: req.studentId!,
          courseId: courseId,
        },
      });
    });

    const alreadyEnrolled =
      enrollment.studentId === req.studentId &&
      enrollment.courseId === courseId;

    res.json({
      success: true,
      message: alreadyEnrolled
        ? "Already enrolled"
        : "Payment successful & enrollment created",
      enrollment,
    });
    return;
  } catch (error: any) {
    console.error("Capture Payment Error:", error);

    if (error?.error?.description === "Payment already captured") {
      res.json({
        success: true,
        message: "Payment already captured",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error capturing payment",
    });
    return;
  }
};
