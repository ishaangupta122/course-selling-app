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
import { UserCog, Users, BookOpen, IndianRupee } from "lucide-react";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "instructors" | "students"
  >("overview");

  const { data: profileData } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });
  // ─── Queries ────────────────────────────────────────────────────────────────

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getPlatformStats,
  });

  const {
    data: instructorsData,
    isLoading: instructorsLoading,
    error: instructorsError,
  } = useQuery({
    queryKey: ["adminInstructors"],
    queryFn: getAllInstructors,
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["adminStudents"],
    queryFn: getAllStudents,
  });

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const deleteInstructorMutation = useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminInstructors"] }),
    onError: (err: any) =>
      alert(err?.response?.data?.message ?? "Failed to delete instructor"),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminStudents"] }),
    onError: (err: any) =>
      alert(err?.response?.data?.message ?? "Failed to delete student"),
  });

  const stats = statsData?.stats;
  const instructors: Instructor[] = instructorsData?.instructors ?? [];
  const students: Student[] = studentsData?.students ?? [];

  const statCards = stats
    ? [
        {
          label: "Total Instructors",
          value: stats.totalInstructors,
          icon: UserCog,
          cardClass: "bg-blue-50 border-blue-100",
          iconClass: "bg-blue-100 text-blue-700",
          valueClass: "text-blue-900",
        },
        {
          label: "Total Students",
          value: stats.totalStudents,
          icon: Users,
          cardClass: "bg-violet-50 border-violet-100",
          iconClass: "bg-violet-100 text-violet-700",
          valueClass: "text-violet-900",
        },
        {
          label: "Total Courses",
          value: stats.totalCourses,
          icon: BookOpen,
          cardClass: "bg-indigo-50 border-indigo-100",
          iconClass: "bg-indigo-100 text-indigo-700",
          valueClass: "text-indigo-900",
        },
        {
          label: "Total Revenue",
          value: `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`,
          icon: IndianRupee,
          cardClass: "bg-emerald-50/80 border-emerald-100",
          iconClass: "bg-emerald-100/80 text-emerald-700",
          valueClass: "text-emerald-900",
        },
      ]
    : [];

  const admin = profileData?.admin;
  const isMutating =
    deleteInstructorMutation.isPending || deleteStudentMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminName={admin?.name} adminEmail={admin?.email} />

      <main className="px-4 lg:px-8 pt-6 pb-16">
        <div className="max-w-screen-lg mx-auto">
          {/* Tab nav */}
          <div className="my-6 flex items-center justify-end gap-2">
            {(["overview", "instructors", "students"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Platform Overview
              </h2>
              {statsLoading && (
                <p className="text-gray-500 text-sm">Loading stats...</p>
              )}
              {statsError && (
                <p className="text-red-500 text-sm">Failed to load stats.</p>
              )}
              {!statsLoading && !statsError && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className={`rounded-xl border p-5 shadow-sm ${card.cardClass}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {card.label}
                          </span>
                          <p
                            className={`mt-3 text-3xl font-bold ${card.valueClass}`}>
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.iconClass}`}>
                          <card.icon size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructors Tab */}
          {activeTab === "instructors" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Instructors
              </h2>
              {instructorsLoading && (
                <p className="text-gray-500 text-sm">Loading instructors...</p>
              )}
              {instructorsError && (
                <p className="text-red-500 text-sm">
                  Failed to load instructors.
                </p>
              )}
              {!instructorsLoading && !instructorsError && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {instructors.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                      No instructors found.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Name
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Email
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Organization
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Slug
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {instructors.map((instructor) => (
                          <tr key={instructor.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {instructor.name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {instructor.email}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {instructor.organization}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                              {instructor.slug}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                id={`delete-instructor-${instructor.id}`}
                                disabled={isMutating}
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete instructor ${instructor.name}?`,
                                    )
                                  ) {
                                    deleteInstructorMutation.mutate(
                                      instructor.id,
                                    );
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Students
              </h2>
              {studentsLoading && (
                <p className="text-gray-500 text-sm">Loading students...</p>
              )}
              {studentsError && (
                <p className="text-red-500 text-sm">Failed to load students.</p>
              )}
              {!studentsLoading && !studentsError && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {students.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                      No students found.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Name
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Email
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Tenant
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Joined
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {student.email}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                              {student.tenant ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {student.createdAt
                                ? new Date(
                                    student.createdAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                id={`delete-student-${student.id}`}
                                disabled={isMutating}
                                onClick={() => {
                                  if (
                                    confirm(`Delete student ${student.name}?`)
                                  ) {
                                    deleteStudentMutation.mutate(student.id);
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition">
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
