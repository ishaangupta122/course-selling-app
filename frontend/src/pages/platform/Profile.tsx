import { useState, useEffect } from "react";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructorProfile, updateInstructorProfile } from "../../api/instructor";
import { Error, Loading } from "../../components/LoadingError";

const Profile = () => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery({
    queryKey: ["instructorProfile"],
    queryFn: getInstructorProfile,
  });

  const instructor = data?.instructor;

  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (instructor) {
      setName(instructor.name);
    }
  }, [instructor]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateInstructorProfile({
        ...(name !== instructor?.name ? { name } : {}),
        ...(password ? { password } : {}),
      }),
    onSuccess: () => {
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["instructorProfile"] });
      alert("Profile updated successfully.");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Failed to update profile.");
    },
  });

  if (isLoading) return <Loading />;
  if (error || !instructor) return <Error />;

  return (
    <>
      <div className="flex flex-col sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Profile
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
            >
              {/* Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email — read-only */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={instructor.email}
                    readOnly
                    className="block w-full pl-10 pr-3 py-2 border rounded-md bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Organization — read-only */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GoOrganization className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="organization"
                    value={instructor.organization}
                    readOnly
                    className="block w-full pl-10 pr-3 py-2 border rounded-md bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
