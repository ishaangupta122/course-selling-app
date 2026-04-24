import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import AddCourse from "../../components/instructor/AddCourse";
import useStudents from "../../hooks/useInstructorUsers";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "../../api/courses";
import { Error, Loading } from "../../components/LoadingError";
import { Course } from "../../utils/types";

const Dashboard = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const { students, instructor } = useStudents();
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] =
    useState<boolean>(false);
  const [isUpdateCourseModalOpen, setIsUpdateCourseModalOpen] =
    useState<boolean>(false);

  const handleClickAway = () => {
    setIsAddCourseModalOpen(false);
    setIsUpdateCourseModalOpen(false);
  };

  useEffect(() => {
    if (data?.courses) {
      setCourses(data.courses);
    }
  }, [data]);

  const totalRevenue = courses.reduce(
    (sum, course) => sum + Number(course.enrollmentsCount ?? 0) * course.price,
    0,
  );

  useEffect(() => {
    if (isAddCourseModalOpen || isUpdateCourseModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAddCourseModalOpen, isUpdateCourseModalOpen]);

  if (isLoading || !courses) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <>
      <div className="lg:px-8 px-4 pt-4">
        {/* Topbar */}
        {instructor && (
          <div className="max-w-screen-lg mx-auto flex items-center justify-between bg-white shadow-md p-4 mb-4 rounded-md">
            <div className="">
              <h1 className="text-lg font-bold">
                Access your site at:{" "}
                <Link
                  to={`http://${instructor?.slug}.localhost:5173`}
                  target="_blank"
                  className="underline text-[#1a0dab]">
                  http://{instructor?.slug}.localhost:5173
                </Link>
              </h1>
            </div>
            <Link
              to="/instructor/students"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View Students
            </Link>
          </div>
        )}

        {/* Cards */}
        <div className="min-w-screen flex items-center justify-center px-5 py-5">
          <div className="w-full max-w-screen-lg">
            <div className="-mx-2 md:flex">
              <div className="w-full md:w-1/3 px-2">
                <div className="rounded-lg shadow-sm mb-4">
                  <div className="rounded-lg bg-white shadow-lg md:shadow-xl relative overflow-hidden">
                    <div className="px-3 py-8 text-center relative">
                      <h4 className="text-sm uppercase text-gray-500 leading-tight">
                        Total Students
                      </h4>
                      <h3 className="text-3xl text-gray-700 font-semibold leading-tight mt-3">
                        {students.length}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="rounded-lg shadow-sm mb-4">
                  <div className="rounded-lg bg-white shadow-lg md:shadow-xl relative overflow-hidden">
                    <div className="px-3 py-8 text-center relative">
                      <h4 className="text-sm uppercase text-gray-500 leading-tight">
                        Total Courses
                      </h4>
                      <h3 className="text-3xl text-gray-700 font-semibold leading-tight mt-3">
                        {courses.length}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="rounded-lg shadow-sm mb-4">
                  <div className="rounded-lg bg-white shadow-lg md:shadow-xl relative overflow-hidden">
                    <div className="px-3 py-8 text-center relative">
                      <h4 className="text-sm uppercase text-gray-500 leading-tight">
                        Total Revenue
                      </h4>
                      <h3 className="text-3xl text-gray-700 font-semibold leading-tight mt-3">
                        ₹{totalRevenue.toLocaleString("en-IN")}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manage Courses */}
        <div className="max-w-screen-lg mx-auto mt-10 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Manage Courses</h1>
            <button
              className="flex items-center bg-black px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-gray-800 transition"
              onClick={() => setIsAddCourseModalOpen(true)}>
              <Plus size={16} />
              <span className="pl-2">Add Course</span>
            </button>
          </div>

          {!courses.length ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400">
                No courses yet. Create your first course!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link
                  to={`/instructor/dashboard/course/${course.id}`}
                  key={course.id}
                  className="group">
                  <div className="h-full flex flex-col rounded-xl bg-white border border-gray-200 overflow-hidden hover:shadow-md transition">
                    {/* Fixed-height thumbnail */}
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Card body — grows to fill height */}
                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-xs text-gray-400 line-clamp-2 flex-1">
                        {course.description}
                      </p>

                      {/* Badges row */}
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
                        <span className="bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-xs font-medium">
                          {Number(course.enrollmentsCount ?? 0)} students
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{course.price.toLocaleString("en-IN")}
                        </span>
                        {course.startDate && (
                          <span className="text-xs text-gray-400">
                            {course.startDate.slice(0, 10)}
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
      </div>

      {/* Add Course Modal */}
      {isAddCourseModalOpen && <AddCourse handleClickAway={handleClickAway} />}
    </>
  );
};

export default Dashboard;
