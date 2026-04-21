import axios from "axios";
import { API_URL } from "../config";

export const getCourses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.get(`${API_URL}/instructor/courses`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses", error);
    throw error;
  }
};

export const getCourse = async (courseId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.get(`${API_URL}/instructor/course/${courseId}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course", error);
    throw error;
  }
};

export const getCoursesByInstructor = async () => {
  try {
    const response = await axios.get(`${API_URL}/course`);
    return response.data;
  } catch (error) {
    console.error("Error fetching courses", error);
    throw error;
  }
};

// Public course detail — used by students. Now returns folders + contents.
export const getCourseDetail = async (courseId: string) => {
  try {
    const response = await axios.get(`${API_URL}/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course detail", error);
    throw error;
  }
};

export const getEnrolledCourses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.get(`${API_URL}/student/courses`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching enrolled courses", error);
    throw error;
  }
};

// Delete a folder (instructor)
export const deleteCourseFolder = async (folderId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.delete(`${API_URL}/course/folder/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting folder", error);
    throw error;
  }
};

// Delete a content item (instructor)
export const deleteCourseContent = async (contentId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.delete(`${API_URL}/course/content/${contentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting content", error);
    throw error;
  }
};

// Delete an entire course (instructor) — also removes all S3 files on the backend
export const deleteCourse = async (courseId: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.delete(`${API_URL}/instructor/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting course", error);
    throw error;
  }
};

// Reorder content items within a folder (persist positions to DB)
export const reorderContent = async (folderId: string, orderedIds: string[]) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");
    const response = await axios.patch(
      `${API_URL}/course/folder/${folderId}/reorder`,
      { orderedIds },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    console.error("Error reordering content", error);
    throw error;
  }
};
