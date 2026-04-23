import { useState, useEffect } from "react";
import { getInstructorStudents } from "../api/instructor";
import { getInstructorProfile } from "../api/instructor";
import { Instructor, Student } from "../utils/types";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [instructor, setInstructor] = useState<Instructor | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsRes, profileRes] = await Promise.all([
          getInstructorStudents(),
          getInstructorProfile(),
        ]);
        setStudents(studentsRes.students ?? []);
        setInstructor(profileRes.instructor);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { students, instructor, loading, error };
};

export default useStudents;
