import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { query } from "../db";
import {
  buildCourseWithFolders,
  toCoursePayload,
  toCourseWithCountPayload,
  toInstructorPayload,
  toStudentPayload,
} from "../helper/dbMappers";
import { deleteMultipleFiles } from "../helper/aws";
import {
  CourseRow,
  CourseWithEnrollmentCountRow,
  CourseFolderRow,
  CourseContentRow,
  InstructorRow,
  StudentRow,
} from "../helper/types";
import {
  SignInSchema,
  InstructorSignUpSchema,
  CourseSchema,
} from "../zod/validator";
import { SQL } from "../helper/queries";

function generateSlug(organization: string): string {
  return organization
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

function getFirstParam(param: string | string[]) {
  return Array.isArray(param) ? param[0] : param;
}

async function getInstructorById(instructorId: string) {
  const result = await query<InstructorRow>(SQL.instructor.findById, [
    instructorId,
  ]);
  return result.rows[0] ?? null;
}

async function getInstructorByEmail(email: string) {
  const result = await query<InstructorRow>(SQL.instructor.findByEmail, [
    email,
  ]);
  return result.rows[0] ?? null;
}

async function getCourseDetails(courseId: string, instructorId?: string) {
  const courseResult = instructorId
    ? await query<CourseRow>(SQL.course.findByInstructor, [
        courseId,
        instructorId,
      ])
    : await query<CourseRow>(SQL.course.findById, [courseId]);
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

// ─── Auth ────────────────────────────────────────────────────────────────────

export const Signup = async (req: Request, res: Response): Promise<void> => {
  const parsedData = InstructorSignUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const slug = generateSlug(parsedData.data.organization);
    const existingInstructor = await getInstructorByEmail(
      parsedData.data.email,
    );

    if (existingInstructor) {
      res.status(400).json({ message: "Instructor already exists!" });
      return;
    }

    const instructorResult = await query<InstructorRow>(SQL.instructor.create, [
      nanoid(),
      parsedData.data.name,
      parsedData.data.email,
      hashedPassword,
      parsedData.data.organization,
      slug,
    ]);
    const instructor = instructorResult.rows[0];

    const token = jwt.sign(
      { instructorId: instructor.id, role: "instructor" },
      JWT_SECRET!,
    );

    if (!token) {
      res.status(500).json({ message: "Something went wrong!" });
      return;
    }

    res.status(200).json({
      message: "Signed up Successfully!",
      instructorId: instructor.id,
      token,
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const Signin = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SignInSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    const instructor = await getInstructorByEmail(parsedData.data.email);

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const isMatch = await bcrypt.compare(
      parsedData.data.password,
      instructor.password,
    );

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { instructorId: instructor.id, role: "instructor" },
      JWT_SECRET!,
    );

    res.status(200).json({
      message: "Signed in Successfully!",
      instructorId: instructor.id,
      token,
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const GetProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructor = await getInstructorById(req.instructorId!);

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Profile fetched successfully!",
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const UpdateProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, password } = req.body;

  try {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const instructorResult = await query<InstructorRow>(
      SQL.instructor.updateProfile,
      [req.instructorId!, name ?? null, hashedPassword ?? null],
    );
    const instructor = instructorResult.rows[0];

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// ─── Students ────────────────────────────────────────────────────────────────

export const getInstructorStudents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [instructorResult, studentsResult] = await Promise.all([
      query<InstructorRow>(SQL.instructor.findById, [req.instructorId!]),
      query<StudentRow>(SQL.instructor.getStudents, [req.instructorId!]),
    ]);

    const instructor = instructorResult.rows[0];

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Students fetched successfully!",
      students: studentsResult.rows.map(toStudentPayload),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// ─── Courses ─────────────────────────────────────────────────────────────────

export const AddCourse = async (req: Request, res: Response): Promise<void> => {
  const parsedData = CourseSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    res.status(400).json({ message: "Invalid data!" });
    return;
  }

  const parsedStartDate = parsedData.data.startDate
    ? new Date(parsedData.data.startDate)
    : null;
  const parsedEndDate = parsedData.data.endDate
    ? new Date(parsedData.data.endDate)
    : null;

  try {
    const courseResult = await query<CourseRow>(SQL.course.create, [
      nanoid(),
      req.instructorId!,
      parsedData.data.title,
      parsedData.data.description,
      parsedData.data.price,
      parsedData.data.thumbnailUrl,
      parsedData.data.level ?? null,
      parsedData.data.type ?? null,
      parsedStartDate,
      parsedEndDate,
    ]);

    res.status(200).json({
      message: "Course added successfully!",
      course: toCoursePayload(courseResult.rows[0]),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const UpdateCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const courseId = req.params.id;
  const parsedData = CourseSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }

  const parsedStartDate = parsedData.data.startDate
    ? new Date(parsedData.data.startDate)
    : null;
  const parsedEndDate = parsedData.data.endDate
    ? new Date(parsedData.data.endDate)
    : null;

  try {
    const courseResult = await query<CourseRow>(SQL.course.updateByInstructor, [
      courseId,
      req.instructorId!,
      parsedData.data.title,
      parsedData.data.description,
      parsedData.data.price,
      parsedData.data.thumbnailUrl,
      parsedData.data.level ?? null,
      parsedData.data.type ?? null,
      parsedStartDate,
      parsedEndDate,
    ]);
    const course = courseResult.rows[0];

    if (!course) {
      res.status(404).json({ message: "Course not found or update failed!" });
      return;
    }

    res.status(200).json({
      message: "Course updated successfully!",
      course: toCoursePayload(course),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const GetCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instructor = await getInstructorById(req.instructorId!);

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const coursesResult = await query<CourseWithEnrollmentCountRow>(
      SQL.course.getByInstructorWithCounts,
      [req.instructorId!],
    );

    res.status(200).json({
      message: "Courses fetched successfully!",
      courses: coursesResult.rows.map(toCourseWithCountPayload),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const GetCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await getCourseDetails(
      getFirstParam(req.params.id),
      req.instructorId!,
    );

    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    res.status(200).json({
      message: "Course fetched successfully!",
      course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const DeleteCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await getCourseDetails(
      getFirstParam(req.params.id),
      req.instructorId!,
    );

    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    const fileUrls = course.courseFolders.flatMap((folder) =>
      folder.courseContents.map((content) => content.url),
    );

    await deleteMultipleFiles(fileUrls);
    await query(SQL.course.deleteByInstructor, [
      req.params.id,
      req.instructorId!,
    ]);

    res.status(200).json({
      message: `Course deleted with ${fileUrls.length} file(s) removed from storage.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
