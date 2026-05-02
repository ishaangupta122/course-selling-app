import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { query } from "../db";
import {
  toEnrollmentPayload,
  toStudentEnrollmentCoursePayload,
  toStudentPayload,
} from "../helper/dbMappers";
import { extractSubdomain } from "../helper/subdomainHelper";
import {
  EnrollmentRow,
  InstructorRow,
  StudentEnrollmentCourseRow,
  StudentRow,
} from "../helper/types";
import {
  SignInSchema,
  StudentSignUpSchema,
  UpdateStudentSchema,
} from "../zod/validator";
import { SQL } from "../helper/queries";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

async function getInstructorBySlug(slug: string) {
  const result = await query<InstructorRow>(SQL.instructor.findBySlug, [slug]);
  return result.rows[0] ?? null;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const Signup = async (req: Request, res: Response): Promise<void> => {
  const parsedData = StudentSignUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      res.status(400).json({ message: "Invalid subdomain" });
      return;
    }

    const instructor = await getInstructorBySlug(subdomain);

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const existingStudentResult = await query<StudentRow>(
      SQL.student.findByEmailAndInstructor,
      [parsedData.data.email, instructor.id],
    );

    if (existingStudentResult.rows[0]) {
      res.status(400).json({ message: "Student already exists!" });
      return;
    }

    const studentResult = await query<StudentRow>(SQL.student.create, [
      nanoid(),
      parsedData.data.name,
      parsedData.data.email,
      hashedPassword,
      instructor.id,
    ]);
    const student = studentResult.rows[0];

    const token = jwt.sign(
      { studentId: student.id, role: "student" },
      JWT_SECRET!,
    );

    res.status(200).json({
      message: "Signed up Successfully!",
      studentId: student.id,
      token,
      student: toStudentPayload(student),
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
    const subdomain = extractSubdomain(req);

    if (!subdomain) {
      res.status(400).json({ message: "Invalid subdomain" });
      return;
    }

    const instructor = await getInstructorBySlug(subdomain);

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const studentResult = await query<StudentRow>(
      SQL.student.findByEmailAndInstructor,
      [parsedData.data.email, instructor.id],
    );
    const student = studentResult.rows[0];

    if (!student) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.data.password,
      student.password,
    );

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { studentId: student.id, role: "student" },
      JWT_SECRET!,
    );

    res.status(200).json({
      message: "Signed in Successfully!",
      studentId: student.id,
      token,
      student: toStudentPayload(student),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const GetProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const studentResult = await query<StudentRow>(SQL.student.findById, [
      req.studentId!,
    ]);
    const student = studentResult.rows[0];

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.status(200).json({
      message: "Profile fetched successfully!",
      student: toStudentPayload(student),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsedData = UpdateStudentSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }

  try {
    let hashedPassword: string | undefined;
    if (parsedData.data.password) {
      hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    }

    const updatedStudentResult = await query<StudentRow>(
      SQL.student.updateProfile,
      [req.studentId!, parsedData.data.name ?? null, hashedPassword ?? null],
    );
    const student = updatedStudentResult.rows[0];

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      student: toStudentPayload(student),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── Enrolled Courses ────────────────────────────────────────────────────────

export const getEnrolledCourses = async (
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
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const enrollmentsResult = await query<StudentEnrollmentCourseRow>(
      SQL.student.getEnrollmentsByInstructor,
      [req.studentId!, instructor.id],
    );

    res.status(200).json({
      message: "All Enrolled Courses",
      enrollments: enrollmentsResult.rows.map(toStudentEnrollmentCoursePayload),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEnrolledCourse = async (
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
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    const enrollmentResult = await query<EnrollmentRow>(
      SQL.student.getEnrollment,
      [req.studentId!, req.params.courseId],
    );
    const enrollment = enrollmentResult.rows[0];

    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    res.status(200).json({
      message: "Enrolled Course",
      enrollment: toEnrollmentPayload(enrollment),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const CheckEnrollment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const enrollmentResult = await query<EnrollmentRow>(
      SQL.student.getEnrollment,
      [req.studentId!, req.params.courseId],
    );

    res.status(200).json({ enrolled: Boolean(enrollmentResult.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
