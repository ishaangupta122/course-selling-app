import { useState, useEffect } from "react";
import { getCourses } from "../api/courses";

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
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourses();
      setCourses(response.courses);
    } catch (err) {
      setError("Failed to fetch courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, error, fetchCourses };
};

export default useCourses;
