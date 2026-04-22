import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Course } from "../../utils/types";
import { getCoursesByInstructor } from "../../api/courses";
import { useQuery } from "@tanstack/react-query";
import { Error, Loading } from "../../components/LoadingError";
import { BookOpen } from "lucide-react";

const InstructorHome = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["courses"],
    queryFn: getCoursesByInstructor,
  });

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (data?.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and enroll in courses offered by your instructor</p>
      </div>

      {!courses.length ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-500">No courses available yet</h2>
          <p className="text-gray-400 text-sm mt-2">Check back later for new courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Link
              to={`/course/${course.id}`}
              key={course.id}
              className="group">
              <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
                {/* Fixed-height thumbnail */}
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h2 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {course.title}
                  </h2>
                  <p className="text-xs text-gray-400 line-clamp-2 flex-1">
                    {course.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {course.level && (
                      <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">
                        {course.level}
                      </span>
                    )}
                    {course.type && (
                      <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">
                        {course.type}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{course.price.toLocaleString("en-IN")}
                    </span>
                    {course.startDate && (
                      <span className="text-xs text-gray-400">
                        Starts {course.startDate.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorHome;
