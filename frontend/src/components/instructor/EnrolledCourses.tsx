import { useState, useEffect } from "react";
import { Course } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "../../api/courses";
import { Error, Loading } from "../LoadingError";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const EnrolledCourses = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: getEnrolledCourses,
  });

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (data?.enrollments) {
      // Backend returns: { message, enrollments: [{ id, studentId, courseId, course: { id, title, ... } }] }
      const mapped = (data.enrollments as any[]).map((e) => e.course).filter(Boolean);
      setCourses(mapped);
    }
  }, [data]);

  if (isLoading || !courses) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Enrolled Courses</h1>

      {!courses.length ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">
            No enrolled courses yet
          </h2>
          <p className="text-gray-400 mt-2">
            Explore and enroll in courses to get started
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="-mx-2 md:flex flex-wrap">
          {courses.map((course, index) => (
            <div className="w-full md:w-1/3 px-2 mb-4" key={index}>
              {/* Link to the student viewer, NOT the buy page */}
              <Link to={`/enrolled-courses/${course.id}`}>
                <div className="rounded-xl bg-white overflow-hidden border hover:shadow-md transition cursor-pointer h-full">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full object-cover aspect-video"
                  />
                  <div className="p-4 space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex gap-2 pt-1">
                      {course.level && (
                        <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
                          {course.level}
                        </span>
                      )}
                      {course.type && (
                        <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
                          {course.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-green-600 pt-1">
                      ✓ Enrolled — View Course →
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
