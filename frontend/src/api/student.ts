import { apiClient } from "./client";
import { Student, Enrollment } from "../utils/types";

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getStudentProfile = async () => {
  const { data } = await apiClient.get<{ message: string; student: Student }>(
    "/student/profile",
  );
  return data;
};

export const updateStudentProfile = async (payload: {
  name?: string;
  password?: string;
}) => {
  const { data } = await apiClient.put<{ message: string; student: Student }>(
    "/student/profile",
    payload,
  );
  return data;
};

// ─── Enrolled Courses ────────────────────────────────────────────────────────

export const getStudentEnrolledCourses = async () => {
  const { data } = await apiClient.get<{
    message: string;
    enrollments: Enrollment[];
  }>("/student/courses");
  return data;
};

export const getStudentEnrolledCourse = async (courseId: string) => {
  const { data } = await apiClient.get<{
    message: string;
    enrollment: Enrollment;
  }>(`/student/courses/${courseId}`);
  return data;
};

export const checkStudentEnrollment = async (courseId: string) => {
  const { data } = await apiClient.get<{ enrolled: boolean }>(
    `/student/${courseId}`,
  );
  return data;
};
