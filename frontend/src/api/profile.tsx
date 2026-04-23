
import { getInstructorProfile } from "./instructor";

// Re-export for backward compat — fetches instructor profile from /instructor/profile
export { getInstructorProfile };

// Alias used in some older components
export const getInstructorProfileLegacy = async () => {
  try {
    const response = await getInstructorProfile();
    return response.instructor;
  } catch (error) {
    console.error("Error fetching instructor profile", error);
    throw error;
  }
};
