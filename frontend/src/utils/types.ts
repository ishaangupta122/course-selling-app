declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CourseContent {
  id: string;
  name: string;
  type: "VIDEO" | "NOTES";
  url: string;
  position: number;
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
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level: string;
  type: string;
  startDate: string;
  endDate: string;
  courseFolders?: CourseFolder[];
  enrollments?: Enrollment[];
  _count?: {
    enrollments: number;
  };
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  organization: string;
  slug: string;
}

export interface Students {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level: string;
  type: string;
  startDate: string;
  endDate: string;
}

export interface AuthResponse {
  message: string;
  instructorId: string;
  token: string;
  instructor: Instructor;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  course: Course;
}
