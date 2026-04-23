declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Content & Courses ────────────────────────────────────────────────────────

export interface CourseContent {
  id: string;
  name: string;
  type: "VIDEO" | "NOTES";
  url: string;
  courseFolderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFolder {
  id: string;
  name: string;
  courseId: string;
  courseContents?: CourseContent[];
}

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  type?: "LIVE" | "RECORDED";
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  courseFolders?: CourseFolder[];
  enrollmentsCount?: string; // from getByInstructorWithCounts — COUNT is returned as text
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  name: string;
  email: string;
  organization: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  instructorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  instructorId: string;
  token: string;
  instructor: Instructor;
}

export interface StudentAuthResponse {
  message: string;
  studentId: string;
  token: string;
  student: Student;
}

export interface AdminAuthResponse {
  message: string;
  adminId: string;
  token: string;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  updatedAt?: string;
}

export interface EnrolledCourse {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  // Course fields from the JOIN
  course_id?: string;
  course_title?: string;
  course_description?: string;
  course_price?: number;
  course_thumbnail_url?: string;
  course_level?: string;
  course_type?: string;
  course_start_date?: string;
  course_end_date?: string;
}
