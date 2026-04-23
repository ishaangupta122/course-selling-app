import { Request } from "express";

export interface UploadResult {
  success: boolean;
  videoUrl: string;
  key: string;
  message: string;
}

export type InstructorStatus = "PENDING" | "ACTIVE" | "BLOCKED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type EnrollmentStatus = "ACTIVE" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface InstructorRow {
  id: string;
  name: string;
  email: string;
  password: string;
  logo: string | null;
  organization: string;
  slug: string;
  url: string | null;
  description: string | null;
  status: InstructorStatus;
  created_at: Date;
  updated_at: Date;
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  instructor_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseRow {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string;
  level: string | null;
  type: string | null;
  start_date: Date | null;
  end_date: Date | null;
  status: CourseStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CourseFolderRow {
  id: string;
  name: string;
  course_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CourseContentRow {
  id: string;
  name: string;
  type: string;
  url: string;
  position: number;
  course_folder_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface EnrollmentRow {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: Date;
  updated_at: Date;
}

export interface PaymentRow {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CourseFolderWithContents extends CourseFolderRow {
  courseContents: CourseContentRow[];
}

export interface PlatformStatsRow {
  total_instructors: string;
  active_instructors: string;
  blocked_instructors: string;
  pending_instructors: string;
  total_students: string;
  total_courses: string;
  published_courses: string;
  total_revenue: string;
}

export interface CourseWithEnrollmentCountRow extends CourseRow {
  enrollments_count: string;
}

export interface FolderOwnershipRow extends CourseFolderRow {
  instructor_id: string;
}

export interface ContentOwnershipRow extends CourseContentRow {
  instructor_id: string;
}

export interface StudentEnrollmentCourseRow extends EnrollmentRow {
  course_title: string;
  course_description: string | null;
  course_price: number;
  course_thumbnail_url: string;
  course_level: string | null;
  course_type: string | null;
  course_start_date: Date | null;
  course_end_date: Date | null;
  course_status: CourseStatus;
  course_created_at: Date;
  course_updated_at: Date;
  course_instructor_id: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  hashedPassword: string;
}

export interface CreateInstructorInput {
  name: string;
  email: string;
  hashedPassword: string;
  organization: string;
  slug: string;
}

export interface CreateCourseInput {
  instructorId: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level?: string;
  type?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export type UpdateCourseInput = Omit<CreateCourseInput, "instructorId">;

export interface CreateCourseContentInput {
  name: string;
  type: string;
  url: string;
  courseFolderId: string;
}

export interface CreateStudentInput {
  name: string;
  email: string;
  hashedPassword: string;
  instructorId: string;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
}

export interface CreatePaymentOrderInput {
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface UpsertEnrollmentPaymentInput {
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
}

export interface CourseControllerRequest extends Request {
  studentId?: string;
  courseId?: string;
  orderId?: string;
}

export interface StudentAuthRequest extends Request {
  instructor?: InstructorRow | null;
  studentId?: string;
}
