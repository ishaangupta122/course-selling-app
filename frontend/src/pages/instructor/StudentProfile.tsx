import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentProfile, updateStudentProfile } from "../../api/student";
import { Loading, Error } from "../../components/LoadingError";
import { CircleUserRound, Mail, Calendar, Lock } from "lucide-react";

const StudentProfile = () => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  // Backend returns { message, student }
  const studentData = data?.student;

  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (studentData) {
      setName(studentData.name);
    }
  }, [studentData]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateStudentProfile({
        ...(name !== studentData?.name ? { name } : {}),
        ...(password ? { password } : {}),
      }),
    onSuccess: () => {
      setPassword("");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      alert("Profile updated successfully.");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Failed to update profile.");
    },
  });

  if (isLoading) return <Loading />;
  if (error || !studentData) return <Error />;

  const joinDate = studentData.createdAt
    ? new Date(studentData.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 pb-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Gradient header */}
        <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="px-6 pb-6">
          {/* Avatar placeholder */}
          <div className="-mt-12 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow">
              <CircleUserRound size={44} className="text-indigo-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{studentData.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Student</p>

          {/* Info rows */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <span>{studentData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-400 shrink-0" />
              <span>Joined {joinDate}</span>
            </div>
          </div>

          {/* Edit form */}
          <div className="mt-6">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate();
                }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password{" "}
                    <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(studentData.name);
                      setPassword("");
                    }}
                    className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
