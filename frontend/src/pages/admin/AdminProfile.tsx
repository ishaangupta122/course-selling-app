import { useState, useEffect } from "react";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { Shield, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProfile, updateAdminProfile } from "../../api/admin";
import AdminNavbar from "../../components/platform/AdminNavbar";

const AdminProfile = () => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });

  const admin = data?.admin;

  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (admin) setName(admin.name);
  }, [admin]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminProfile({
        ...(name !== admin?.name ? { name } : {}),
        ...(password ? { password } : {}),
      }),
    onSuccess: () => {
      setPassword("");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      alert("Profile updated successfully.");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Failed to update profile.");
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          Loading...
        </div>
      </div>
    );

  if (error || !admin)
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="flex items-center justify-center h-64 text-red-500 text-sm">
          Failed to load profile.
        </div>
      </div>
    );

  const initials = admin.name
    ? admin.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const joinDate = admin.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar adminName={admin.name} adminEmail={admin.email} />

      <div className="max-w-lg mx-auto mt-10 px-4 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="h-28 bg-gradient-to-r from-violet-600 to-indigo-700" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-12 mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow">
                <span className="text-white font-bold text-xl">{initials}</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{admin.name}</h1>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Shield size={11} /> Administrator
            </span>

            {/* Info */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <FaEnvelope className="text-gray-400 shrink-0" />
                <span>{admin.email}</span>
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
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
                  Edit Profile
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMutation.mutate();
                  }}
                  className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password{" "}
                      <span className="text-gray-400 font-normal">
                        (leave blank to keep current)
                      </span>
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-2.5 text-gray-400 text-sm" />
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
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setName(admin.name);
                        setPassword("");
                      }}
                      className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
