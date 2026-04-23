import { apiClient } from "./client";
import { AdminAuthResponse, Admin, Student, Instructor } from "../utils/types";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const adminSignup = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<AdminAuthResponse>(
    "/admin/signup",
    payload,
  );
  return data;
};

export const adminSignin = async (payload: {
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<AdminAuthResponse>(
    "/admin/signin",
    payload,
  );
  return data;
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getAdminProfile = async () => {
  const { data } = await apiClient.get<{ message: string; admin: Admin }>(
    "/admin/profile",
  );
  return data;
};

export const updateAdminProfile = async (payload: {
  name?: string;
  password?: string;
}) => {
  const { data } = await apiClient.put<{ message: string; admin: Admin }>(
    "/admin/profile",
    payload,
  );
  return data;
};

// ─── Instructors ──────────────────────────────────────────────────────────────

export const getAllInstructors = async () => {
  const { data } = await apiClient.get<{
    message: string;
    instructors: Instructor[];
  }>("/admin/instructors");
  return data;
};

export const deleteInstructor = async (instructorId: string) => {
  const { data } = await apiClient.delete(
    `/admin/instructors/${instructorId}`,
  );
  return data;
};

// ─── Students ────────────────────────────────────────────────────────────────

export const getAllStudents = async () => {
  const { data } = await apiClient.get<{
    message: string;
    students: Student[];
  }>("/admin/students");
  return data;
};

export const deleteStudent = async (studentId: string) => {
  const { data } = await apiClient.delete(`/admin/students/${studentId}`);
  return data;
};

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface PlatformStats {
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
}

export const getPlatformStats = async () => {
  const { data } = await apiClient.get<{
    message: string;
    stats: PlatformStats;
  }>("/admin/stats");
  return data;
};
