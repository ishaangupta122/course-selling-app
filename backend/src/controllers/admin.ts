import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { query } from "../db";
import {
  toAdminPayload,
  toInstructorPayload,
  toPlatformStatsPayload,
  toStudentPayload,
} from "../helper/dbMappers";
import {
  AdminAuthRequest,
  AdminRow,
  InstructorRow,
  PlatformStatsRow,
  StudentRow,
} from "../helper/types";
import { SQL } from "../helper/queries";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const Signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdminResult = await query<AdminRow>(SQL.admin.findByEmail, [
      email,
    ]);
    const existingAdmin = existingAdminResult.rows[0];

    if (existingAdmin) {
      res.status(400).json({ message: "Admin already exists!" });
      return;
    }

    const adminResult = await query<AdminRow>(SQL.admin.create, [
      nanoid(),
      name,
      email,
      hashedPassword,
    ]);
    const admin = adminResult.rows[0];

    const token = jwt.sign({ adminId: admin.id, role: "admin" }, JWT_SECRET!);

    if (!token) {
      res.status(500).json({ message: "Something went wrong!" });
      return;
    }

    res.status(200).json({
      message: "Signed up Successfully!",
      adminId: admin.id,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const Signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const adminResult = await query<AdminRow>(SQL.admin.findByEmail, [email]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({ message: "Admin not found!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid Credentials!" });
      return;
    }

    const token = jwt.sign({ adminId: admin.id, role: "admin" }, JWT_SECRET!);

    if (!token) {
      res.status(500).json({ message: "Something went wrong!" });
      return;
    }

    res.status(200).json({
      message: "Signed in Successfully!",
      adminId: admin.id,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const GetProfile = async (req: AdminAuthRequest, res: Response) => {
  try {
    const adminResult = await query<AdminRow>(SQL.admin.findById, [
      req.adminId,
    ]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({ message: "Admin not found!" });
      return;
    }

    res.status(200).json({
      message: "Profile fetched successfully!",
      admin: toAdminPayload(admin),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UpdateProfile = async (req: AdminAuthRequest, res: Response) => {
  const { name, password } = req.body;

  try {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const adminResult = await query<AdminRow>(SQL.admin.updateProfile, [
      req.adminId,
      name ?? null,
      hashedPassword ?? null,
    ]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({ message: "Admin not found!" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      admin: toAdminPayload(admin),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── Instructors ──────────────────────────────────────────────────────────────

export const GetAllInstructors = async (req: Request, res: Response) => {
  try {
    const result = await query<InstructorRow>(SQL.admin.getAllInstructors);
    res.status(200).json({
      message: "Instructors fetched successfully!",
      instructors: result.rows.map(toInstructorPayload),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteInstructor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await query(SQL.admin.deleteInstructor, [id]);
    res.status(200).json({ message: "Instructor deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── Students ────────────────────────────────────────────────────────────────

export const GetAllStudents = async (req: Request, res: Response) => {
  try {
    const result = await query<StudentRow>(SQL.admin.getAllStudents);
    res.status(200).json({
      message: "Students fetched successfully!",
      students: result.rows.map(toStudentPayload),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await query(SQL.admin.deleteStudent, [id]);
    res.status(200).json({ message: "Student deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── Platform Stats ───────────────────────────────────────────────────────────

export const GetPlatformStats = async (req: Request, res: Response) => {
  try {
    const statsResult = await query<PlatformStatsRow>(
      SQL.admin.getPlatformStats,
    );

    res.status(200).json({
      message: "Platform stats fetched successfully!",
      stats: toPlatformStatsPayload(statsResult.rows[0]),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
