import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { query } from "../db";
import {
  toInstructorPayload,
  toPlatformStatsPayload,
} from "../helper/dbMappers";
import { AdminRow, InstructorRow, PlatformStatsRow } from "../helper/types";
import { SQL } from "../helper/queries";

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
      res.status(400).json({
        message: "Admin already exists!",
      });
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
      res.status(500).json({
        message: "Something went wrong!",
      });
      return;
    }

    res.status(200).json({
      message: "Signed up Successfully!",
      adminId: admin.id,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const Signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const adminResult = await query<AdminRow>(SQL.admin.findByEmail, [email]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({
        message: "Admin not found!",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid Credentials!",
      });
      return;
    }

    const token = jwt.sign({ adminId: admin.id, role: "admin" }, JWT_SECRET!);

    if (!token) {
      res.status(500).json({
        message: "Something went wrong!",
      });
      return;
    }

    res.status(200).json({
      message: "Signed in Successfully!",
      adminId: admin.id,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

async function updateInstructorStatus(
  instructorId: string,
  status: "ACTIVE" | "BLOCKED",
) {
  const instructorResult = await query<InstructorRow>(
    SQL.admin.setInstructorStatus,
    [instructorId, status],
  );

  return instructorResult.rows[0] ?? null;
}

export const ApproveInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = Array.isArray(req.params.instructorId)
      ? req.params.instructorId[0]
      : req.params.instructorId;
    const instructor = await updateInstructorStatus(instructorId, "ACTIVE");

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Instructor approved successfully!",
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const BlockInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = Array.isArray(req.params.instructorId)
      ? req.params.instructorId[0]
      : req.params.instructorId;
    const instructor = await updateInstructorStatus(instructorId, "BLOCKED");

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Instructor blocked successfully!",
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const UnblockInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = Array.isArray(req.params.instructorId)
      ? req.params.instructorId[0]
      : req.params.instructorId;
    const instructor = await updateInstructorStatus(instructorId, "ACTIVE");

    if (!instructor) {
      res.status(404).json({ message: "Instructor not found!" });
      return;
    }

    res.status(200).json({
      message: "Instructor unblocked successfully!",
      instructor: toInstructorPayload(instructor),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
