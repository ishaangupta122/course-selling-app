import {
  AdminRow,
  CourseContentRow,
  CourseFolderRow,
  CourseRow,
  CourseWithEnrollmentCountRow,
  EnrollmentRow,
  InstructorRow,
  PlatformStatsRow,
  StudentEnrollmentCourseRow,
  StudentRow,
} from "./types";

export function toAdminPayload(row: AdminRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCoursePayload(row: CourseRow) {
  return {
    id: row.id,
    instructorId: row.instructor_id,
    title: row.title,
    description: row.description,
    price: row.price,
    thumbnailUrl: row.thumbnail_url,
    level: row.level,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCourseWithCountPayload(row: CourseWithEnrollmentCountRow) {
  return {
    ...toCoursePayload(row),
    _count: {
      enrollments: Number(row.enrollments_count),
    },
  };
}

export function toInstructorPayload(row: InstructorRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    organization: row.organization,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toStudentPayload(row: StudentRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    instructorId: row.instructor_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toEnrollmentPayload(row: EnrollmentRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    updatedAt: row.updated_at,
  };
}

export function toPlatformStatsPayload(row?: PlatformStatsRow) {
  if (!row) {
    return {
      totalInstructors: 0,
      totalStudents: 0,
      totalCourses: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalInstructors: Number(row.total_instructors),
    totalStudents: Number(row.total_students),
    totalCourses: Number(row.total_courses),
    totalRevenue: Number(row.total_revenue),
  };
}

export function buildCourseWithFolders(
  course: CourseRow,
  folders: CourseFolderRow[],
  contents: CourseContentRow[],
) {
  const contentsByFolder = new Map<string, CourseContentRow[]>();

  for (const content of contents) {
    const folderContents = contentsByFolder.get(content.course_folder_id) ?? [];
    folderContents.push(content);
    contentsByFolder.set(content.course_folder_id, folderContents);
  }

  return {
    ...toCoursePayload(course),
    courseFolders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      courseId: folder.course_id,
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
      courseContents: (contentsByFolder.get(folder.id) ?? []).map((content) => ({
        id: content.id,
        name: content.name,
        type: content.type,
        url: content.url,
        courseFolderId: content.course_folder_id,
        createdAt: content.created_at,
        updatedAt: content.updated_at,
      })),
    })),
  };
}

export function toStudentEnrollmentCoursePayload(row: StudentEnrollmentCourseRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    updatedAt: row.updated_at,
    course: {
      id: row.course_id,
      instructorId: row.course_instructor_id,
      title: row.course_title,
      description: row.course_description,
      price: row.course_price,
      thumbnailUrl: row.course_thumbnail_url,
      level: row.course_level,
      type: row.course_type,
      startDate: row.course_start_date,
      endDate: row.course_end_date,
      createdAt: row.course_created_at,
      updatedAt: row.course_updated_at,
    },
  };
}
