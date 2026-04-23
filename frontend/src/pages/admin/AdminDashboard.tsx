import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInstructors,
  getAllStudents,
  getPlatformStats,
  deleteInstructor,
  deleteStudent,
  getAdminProfile,
} from "../../api/admin";
import { Instructor, Student } from "../../utils/types";
import AdminNavbar from "../../components/platform/AdminNavbar";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "instructors" | "students">("overview");

  const { data: profileData } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });
  // ─── Queries ────────────────────────────────────────────────────────────────

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getPlatformStats,
  });

  const { data: instructorsData, isLoading: instructorsLoading, error: instructorsError } = useQuery({
    queryKey: ["adminInstructors"],
    queryFn: getAllInstructors,
  });

  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ["adminStudents"],
    queryFn: getAllStudents,
  });

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const deleteInstructorMutation = useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminInstructors"] }),
    onError: (err: any) => alert(err?.response?.data?.message ?? "Failed to delete instructor"),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminStudents"] }),
    onError: (err: any) => alert(err?.response?.data?.message ?? "Failed to delete student"),
  });



  const stats = statsData?.stats;
  const instructors: Instructor[] = instructorsData?.instructors ?? [];
  const students: Student[] = studentsData?.students ?? [];

  const statCards = stats
    ? [
        { label: "Total Instructors", value: stats.totalInstructors, color: "bg-blue-50 text-blue-700" },
        { label: "Total Students", value: stats.totalStudents, color: "bg-purple-50 text-purple-700" },
        { label: "Total Courses", value: stats.totalCourses, color: "bg-indigo-50 text-indigo-700" },
        { label: "Total Revenue", value: `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`, color: "bg-emerald-50 text-emerald-700" },
      ]
    : [];

  const admin = profileData?.admin;
  const isMutating = deleteInstructorMutation.isPending || deleteStudentMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar adminName={admin?.name} adminEmail={admin?.email} />

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-11">
          {(["overview", "instructors", "students"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Platform Overview</h2>
            {statsLoading && <p className="text-gray-500 text-sm">Loading stats...</p>}
            {statsError && <p className="text-red-500 text-sm">Failed to load stats.</p>}
            {!statsLoading && !statsError && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card) => (
                  <div key={card.label} className={`rounded-xl p-5 ${card.color} flex flex-col gap-1`}>
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">{card.label}</span>
                    <span className="text-2xl font-bold">{card.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructors Tab */}
        {activeTab === "instructors" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Instructors</h2>
            {instructorsLoading && <p className="text-gray-500 text-sm">Loading instructors...</p>}
            {instructorsError && <p className="text-red-500 text-sm">Failed to load instructors.</p>}
            {!instructorsLoading && !instructorsError && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {instructors.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">No instructors found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Organization</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {instructors.map((instructor) => (
                        <tr key={instructor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{instructor.name}</td>
                          <td className="px-4 py-3 text-gray-600">{instructor.email}</td>
                          <td className="px-4 py-3 text-gray-600">{instructor.organization}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{instructor.slug}</td>
                          <td className="px-4 py-3">
                            <button
                              id={`delete-instructor-${instructor.id}`}
                              disabled={isMutating}
                              onClick={() => {
                                if (confirm(`Delete instructor ${instructor.name}?`)) {
                                  deleteInstructorMutation.mutate(instructor.id);
                                }
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Students</h2>
            {studentsLoading && <p className="text-gray-500 text-sm">Loading students...</p>}
            {studentsError && <p className="text-red-500 text-sm">Failed to load students.</p>}
            {!studentsLoading && !studentsError && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {students.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">No students found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                          <td className="px-4 py-3 text-gray-600">{student.email}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              id={`delete-student-${student.id}`}
                              disabled={isMutating}
                              onClick={() => {
                                if (confirm(`Delete student ${student.name}?`)) {
                                  deleteStudentMutation.mutate(student.id);
                                }
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
