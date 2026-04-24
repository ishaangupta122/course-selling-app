import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInstructorStudents } from "../../api/instructor";
import { Error, Loading } from "../../components/LoadingError";
import { Student } from "../../utils/types";

const StudentsList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["instructorStudents"],
    queryFn: getInstructorStudents,
  });

  const students = (data?.students ?? []) as Student[];

  const filteredStudents = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedTerm) ||
        student.email.toLowerCase().includes(normalizedTerm),
    );
  }, [students, searchTerm]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="px-4 lg:px-8 pt-4 pb-16">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students List</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and search all students registered under your organization.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-w-[170px]">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Students
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {students.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {!filteredStudents.length ? (
            <div className="p-10 text-center text-gray-500">
              {students.length
                ? "No students match your search."
                : "No students have signed up yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
