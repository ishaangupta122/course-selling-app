import { Request, Response } from "express";
import Razorpay from "razorpay";
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
import { nanoid } from "nanoid";
import { query, withTransaction } from "../db";
import {
  buildCourseWithFolders,
  toEnrollmentPayload,
} from "../helper/dbMappers";
import {
  ContentOwnershipRow,
  CourseContentRow,
  CourseControllerRequest,
  CourseFolderRow,
  CourseRow,
  EnrollmentRow,
  FolderOwnershipRow,
  InstructorRow,
  PaymentRow,
  StudentRow,
} from "../helper/types";
import { SQL } from "../helper/queries";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function getFirstParam(param: string | string[]) {
  return Array.isArray(param) ? param[0] : param;
}

async function getInstructorBySlug(slug: string) {
  const result = await query<InstructorRow>(SQL.instructor.findBySlug, [slug]);
  return result.rows[0] ?? null;
}

async function getInstructorById(instructorId: string) {
  const result = await query<InstructorRow>(SQL.instructor.findById, [
    instructorId,
  ]);
  return result.rows[0] ?? null;
}

async function getCourseDetails(courseId: string) {
  const courseResult = await query<CourseRow>(SQL.course.findById, [courseId]);
  const course = courseResult.rows[0];

  if (!course) {
    return null;
  }

  const [folderResult, contentResult] = await Promise.all([
    query<CourseFolderRow>(SQL.course.getFoldersByCourseId, [courseId]),
    query<CourseContentRow>(SQL.course.getContentsByCourseId, [courseId]),
  ]);

  return buildCourseWithFolders(course, folderResult.rows, contentResult.rows);
}

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

    const instructor = await getInstructorBySlug(subdomain);

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    const coursesResult = await query<CourseRow>(
      SQL.course.findByInstructorSlug,
      [instructor.id],
    );

    res.status(200).json({
      message: "Courses fetched successfully",
      courses: coursesResult.rows.map((course) => ({
        id: course.id,
        instructorId: course.instructor_id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnailUrl: course.thumbnail_url,
        level: course.level,
        type: course.type,
        startDate: course.start_date,
        endDate: course.end_date,
        status: course.status,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
      })),
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error while fetching courses" });
  }
};

export const GetCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await getCourseDetails(getFirstParam(req.params.id));

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
  }
};

export const DeleteFolder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { folderId } = req.params;

  try {
    const folderResult = await query<FolderOwnershipRow>(
      SQL.course.getFolderOwnership,
      [folderId],
    );
    const folder = folderResult.rows[0];

    if (!folder) {
      res.status(404).json({ message: "Folder not found!" });
      return;
    }

    if (folder.instructor_id !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const contentsResult = await query<CourseContentRow>(
      SQL.course.getContentsByFolderId,
      [folderId],
    );
    const fileUrls = contentsResult.rows.map((content) => content.url);

    await deleteMultipleFiles(fileUrls);
    await query(SQL.course.deleteFolderById, [folderId]);

    res.status(200).json({
      message: `Folder deleted with ${fileUrls.length} file(s) removed from storage.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const DeleteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { contentId } = req.params;

  try {
    const contentResult = await query<ContentOwnershipRow>(
      SQL.course.getContentOwnership,
      [contentId],
    );
    const content = contentResult.rows[0];

    if (!content) {
      res.status(404).json({ message: "Content not found!" });
      return;
    }

    if (content.instructor_id !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await deleteFile(content.url);
    await query(SQL.course.deleteContentById, [contentId]);

    res.status(200).json({ message: "Content deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

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
    const folderResult = await query<FolderOwnershipRow>(
      SQL.course.getFolderOwnership,
      [folderId],
    );
    const folder = folderResult.rows[0];

    if (!folder) {
      res.status(404).json({ message: "Folder not found!" });
      return;
    }

    if (folder.instructor_id !== req.instructorId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await withTransaction(async (client) => {
      const existingRows = await client.query<{ id: string }>(
        SQL.course.getContentIdsByFolderId,
        [folderId],
      );

      if (existingRows.rows.length !== orderedIds.length) {
        throw new Error("orderedIds length mismatch");
      }

      const existingIds = new Set(existingRows.rows.map((row) => row.id));
      for (const orderedId of orderedIds) {
        if (!existingIds.has(orderedId)) {
          throw new Error("orderedIds contains invalid content id");
        }
      }

      for (let index = 0; index < orderedIds.length; index += 1) {
        await client.query(SQL.course.updateContentPosition, [
          index,
          orderedIds[index],
          folderId,
        ]);
      }
    });

    res.status(200).json({ message: "Content reordered successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

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

    const instructor = await getInstructorById(req.instructorId);

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    const courseResult = await query<CourseRow>(SQL.course.findById, [
      courseId,
    ]);
    const course = courseResult.rows[0];

    if (!course || course.instructor_id !== instructor.id) {
      res.status(404).json({ message: "Course not found or unauthorized" });
      return;
    }

    const folderPresentResult = await query<CourseFolderRow>(
      SQL.course.findFolderByCourseAndName,
      [courseId, parsedData.data.name],
    );

    if (folderPresentResult.rows[0]) {
      res.status(400).json({
        message: "Folder with similar name already exists",
      });
      return;
    }

    const folderResult = await query<CourseFolderRow>(SQL.course.createFolder, [
      nanoid(),
      parsedData.data.name,
      courseId,
    ]);
    const folder = folderResult.rows[0];

    res.json({
      message: "Folder created successfully",
      folder: {
        id: folder.id,
        name: folder.name,
        courseId: folder.course_id,
        createdAt: folder.created_at,
        updatedAt: folder.updated_at,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UploadVideo = async (
  req: CourseControllerRequest,
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

    const [courseResult, folderResult] = await Promise.all([
      query<CourseRow>(SQL.course.findById, [courseId]),
      query<CourseFolderRow>(SQL.course.findFolderById, [folderId]),
    ]);

    const course = courseResult.rows[0];
    const folder = folderResult.rows[0];

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

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

    const contentResult = await query<CourseContentRow>(
      SQL.course.createContent,
      [nanoid(), name, type, result.videoUrl, folderId],
    );
    const content = contentResult.rows[0];

    res.status(200).json({
      message: "Video uploaded successfully",
      video: {
        id: content.id,
        name: content.name,
        type: content.type,
        url: content.url,
        position: content.position,
        courseFolderId: content.course_folder_id,
        createdAt: content.created_at,
        updatedAt: content.updated_at,
      },
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const ListFolderContents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { courseId, folderName } = req.params;

    const sanitizedFolderName = path
      .normalize(getFirstParam(folderName))
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const prefix = `${req.instructorId}/${courseId}/${sanitizedFolderName}`;

    const params: ListObjectsV2CommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: prefix,
      Delimiter: "/",
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    const folders = (data.CommonPrefixes || []).map(
      (commonPrefix) => commonPrefix.Prefix!.split("/").slice(-2)[0],
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

export const EnrollInCourse = async (
  req: CourseControllerRequest,
  res: Response,
): Promise<void> => {
  try {
    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      res.status(400).json({ message: "Invalid subdomain" });
      return;
    }

    const instructor = await getInstructorBySlug(subdomain);

    if (!instructor) {
      res.status(400).json({
        message: "Instructor not found!",
      });
      return;
    }

    const [courseResult, studentResult] = await Promise.all([
      query<CourseRow>(SQL.course.findById, [req.params.courseId]),
      query<StudentRow>(SQL.student.findById, [req.studentId!]),
    ]);

    const course = courseResult.rows[0];
    const student = studentResult.rows[0];

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

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

    await query<PaymentRow>(SQL.payment.createOrder, [
      nanoid(),
      student.id,
      course.id,
      course.price,
      "INR",
      order.id,
    ]);

    res.status(200).json({
      success: true,
      courseId: course.id,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const CapturePayment = async (
  req: CourseControllerRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

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

    const existingEnrollmentResult = await query<EnrollmentRow>(
      SQL.student.getEnrollment,
      [req.studentId, courseId],
    );
    const existingEnrollment = existingEnrollmentResult.rows[0];

    const enrollment = await withTransaction(async (client) => {
      await client.query(SQL.payment.markSuccess, [
        razorpay_order_id,
        razorpay_payment_id,
      ]);

      if (existingEnrollment) {
        return existingEnrollment;
      }

      const enrollmentResult = await client.query<EnrollmentRow>(
        SQL.payment.createEnrollment,
        [nanoid(), req.studentId!, courseId],
      );

      return enrollmentResult.rows[0];
    });

    res.json({
      success: true,
      message: existingEnrollment
        ? "Already enrolled"
        : "Payment successful & enrollment created",
      enrollment: toEnrollmentPayload(enrollment),
    });
  } catch (error: any) {
    console.error("Capture Payment Error:", error);

    if (req.body?.razorpay_order_id) {
      await query(SQL.payment.markFailed, [req.body.razorpay_order_id]);
    }

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
  }
};
