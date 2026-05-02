import { apiClient } from "./client";

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type CourseType = "LIVE" | "RECORDED";

interface CourseInput {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

const normalizeCoursePayload = (payload: CourseInput) => {
  const normalized: {
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string;
    level?: CourseLevel;
    type?: CourseType;
    startDate?: string;
    endDate?: string;
  } = {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    thumbnailUrl: payload.thumbnailUrl,
  };

  if (payload.level) {
    normalized.level = payload.level as CourseLevel;
  }

  if (payload.type) {
    normalized.type = payload.type as CourseType;
  }

  if (payload.startDate) {
    normalized.startDate = payload.startDate;
  }

  if (payload.endDate) {
    normalized.endDate = payload.endDate;
  }

  return normalized;
};

export const getCourses = async () => {
  try {
    const response = await apiClient.get("/instructor/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses", error);
    throw error;
  }
};

export const getCourse = async (courseId: string) => {
  try {
    const response = await apiClient.get(`/instructor/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course", error);
    throw error;
  }
};

export const getCoursesByInstructor = async () => {
  try {
    const response = await apiClient.get("/course");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses", error);
    throw error;
  }
};

// Public course detail — used by students. Now returns folders + contents.
export const getCourseDetail = async (courseId: string) => {
  try {
    const response = await apiClient.get(`/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course detail", error);
    throw error;
  }
};

export const getEnrolledCourses = async () => {
  try {
    // Backend returns: { message, enrollments: [...] }  (flat array, not double-wrapped)
    const response = await apiClient.get<{
      message: string;
      enrollments: unknown[];
    }>("/student/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching enrolled courses", error);
    throw error;
  }
};

// Delete a folder (instructor)
export const deleteCourseFolder = async (folderId: string) => {
  try {
    const response = await apiClient.delete(`/course/folder/${folderId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting folder", error);
    throw error;
  }
};

// Delete a content item (instructor)
export const deleteCourseContent = async (contentId: string) => {
  try {
    const response = await apiClient.delete(`/course/content/${contentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting content", error);
    throw error;
  }
};

// Delete an entire course (instructor) — also removes all S3 files on the backend
export const deleteCourse = async (courseId: string) => {
  try {
    const response = await apiClient.delete(`/instructor/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting course", error);
    throw error;
  }
};

// NOTE: ReorderContent returns 501 from the backend until a `position` column
// is added to course_contents. Kept here so callers don't break at build time.
export const reorderContent = async (
  folderId: string,
  orderedIds: string[],
) => {
  try {
    const response = await apiClient.patch(
      `/course/folder/${folderId}/reorder`,
      { orderedIds },
    );
    return response.data;
  } catch (error) {
    console.error("Error reordering content", error);
    throw error;
  }
};

export const createCourse = async (payload: CourseInput) => {
  const { data } = await apiClient.post(
    "/instructor/course",
    normalizeCoursePayload(payload),
  );
  return data;
};

export const updateCourse = async (courseId: string, payload: CourseInput) => {
  const { data } = await apiClient.put(
    `/instructor/course/${courseId}`,
    normalizeCoursePayload(payload),
  );
  return data;
};

export const createCourseFolder = async (courseId: string, name: string) => {
  const { data } = await apiClient.post(`/course/createFolder/${courseId}`, {
    name,
  });
  return data;
};

export const uploadCourseContent = async (payload: {
  file: File;
  name: string;
  type: "VIDEO" | "NOTES";
  courseId: string;
  folderId: string;
  onUploadProgress?: (progress: number) => void;
}) => {
  const formData = new FormData();
  formData.append("video", payload.file);
  formData.append("name", payload.name);
  formData.append("type", payload.type);
  formData.append("courseId", payload.courseId);
  formData.append("folderId", payload.folderId);

  const { data } = await apiClient.post("/course/uploadVideo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || !payload.onUploadProgress) {
        return;
      }

      const progress = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100,
      );
      payload.onUploadProgress(progress);
    },
  });
  return data;
};

export const listFolderContents = async (
  courseId: string,
  folderName: string,
) => {
  const { data } = await apiClient.get(
    `/course/videos/${courseId}/${folderName}`,
  );
  return data;
};

export const checkEnrollment = async (courseId: string) => {
  const { data } = await apiClient.get(`/student/${courseId}`);
  return data;
};

export const enrollInCourse = async (courseId: string) => {
  const { data } = await apiClient.post(`/course/enroll/${courseId}`);
  return data;
};

export const capturePayment = async (payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  courseId: string;
}) => {
  const { data } = await apiClient.post("/course/capturePayment", payload);
  return data;
};

export const getEnrolledCourse = async (courseId: string) => {
  try {
    const { data } = await apiClient.get(`/student/courses/${courseId}`);
    return data;
  } catch (error) {
    console.error("Error fetching enrolled course", error);
    throw error;
  }
};
