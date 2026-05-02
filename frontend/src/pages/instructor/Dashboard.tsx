import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  BookOpenCheck,
  IndianRupee,
  ExternalLink,
} from "lucide-react";
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

  const stats = [
    {
      label: "Total Students",
      value: students.length.toLocaleString("en-IN"),
      icon: Users,
      cardClass: "bg-violet-50 border-violet-100",
      iconClass: "bg-violet-100 text-violet-700",
      valueClass: "text-violet-900",
    },
    {
      label: "Total Courses",
      value: courses.length.toLocaleString("en-IN"),
      icon: BookOpenCheck,
      cardClass: "bg-indigo-50 border-indigo-100",
      iconClass: "bg-indigo-100 text-indigo-700",
      valueClass: "text-indigo-900",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      cardClass: "bg-emerald-50/80 border-emerald-100",
      iconClass: "bg-emerald-100/80 text-emerald-700",
      valueClass: "text-emerald-900",
    },
  ];

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
      <div className="lg:px-8 px-4 pt-6">
        {/* Topbar */}
        {instructor && (
          <div className="max-w-screen-lg mx-auto mb-6 rounded-xl border border-blue-100 bg-blue-50 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              Your Tenant URL
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base md:text-lg font-semibold text-blue-900">
                Access your site at:
              </span>
              <Link
                to={`http://${instructor?.slug}.localhost:5173`}
                target="_blank"
                className="inline-flex items-center gap-1 text-base md:text-lg font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800 transition">
                http://{instructor?.slug}.localhost:5173
                <ExternalLink size={16} className="shrink-0" />
              </Link>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="min-w-screen flex items-center justify-center px-2 md:px-5 py-2 md:py-5">
          <div className="w-full max-w-screen-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`rounded-xl border p-5 shadow-sm ${stat.cardClass}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                          {stat.label}
                        </p>
                        <p
                          className={`mt-4 text-4xl font-bold leading-none ${stat.valueClass}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.iconClass}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
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
                        <span className="bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-xs font-medium ml-auto">
                          {Number(course.enrollmentsCount ?? 0)} enrolled
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
