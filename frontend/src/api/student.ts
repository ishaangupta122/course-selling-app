import axios from "axios";
import { API_URL } from "../config";

// Fetch current student's profile — backend returns the student object directly
export const getStudentProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found");
  const response = await axios.get(`${API_URL}/student/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Backend returns the student object directly (not wrapped)
  return response.data;
};
