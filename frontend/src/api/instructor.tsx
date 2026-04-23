import { apiClient } from "./client";
import { Instructor, Student, Course } from "../utils/types";

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getInstructorProfile = async () => {
  const { data } = await apiClient.get<{
    message: string;
    instructor: Instructor;
  }>("/instructor/profile");
  return data;
};

export const updateInstructorProfile = async (payload: {
  name?: string;
  password?: string;
}) => {
  const { data } = await apiClient.put<{
    message: string;
    instructor: Instructor;
  }>("/instructor/profile", payload);
  return data;
};

// ─── Students ────────────────────────────────────────────────────────────────

export const getInstructorStudents = async () => {
  const { data } = await apiClient.get<{
    message: string;
    students: Student[];
  }>("/instructor/students");
  return data;
};

// ─── Courses ─────────────────────────────────────────────────────────────────

export const createInstructorCourse = async (payload: {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  type?: "LIVE" | "RECORDED";
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await apiClient.post<{ message: string; course: Course }>(
    "/instructor/course",
    payload,
  );
  return data;
};

export const updateInstructorCourse = async (
  courseId: string,
  payload: {
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    type?: "LIVE" | "RECORDED";
    startDate?: string;
    endDate?: string;
  },
) => {
  const { data } = await apiClient.put<{ message: string; course: Course }>(
    `/instructor/course/${courseId}`,
    payload,
  );
  return data;
};

export const getInstructorCourses = async () => {
  const { data } = await apiClient.get<{ message: string; courses: Course[] }>(
    "/instructor/courses",
  );
  return data;
};

export const getInstructorCourse = async (courseId: string) => {
  const { data } = await apiClient.get<{ message: string; course: Course }>(
    `/instructor/course/${courseId}`,
  );
  return data;
};

export const deleteInstructorCourse = async (courseId: string) => {
  const { data } = await apiClient.delete(
    `/instructor/course/${courseId}`,
  );
  return data;
};
