import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentProfile } from "../../api/student";
import { Loading, Error } from "../../components/LoadingError";
import { CircleUserRound, Mail, BookOpen, Calendar } from "lucide-react";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  enrollments?: { id: string }[];
}

const StudentProfile = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    // Backend returns the student object directly
    if (data?.id) setProfile(data);
  }, [data]);

  if (isLoading) return <Loading />;
  if (error || !profile) return <Error />;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 pb-16">
      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Gradient header */}
        <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600" />

        {/* Avatar */}
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-white object-cover shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow">
                <CircleUserRound size={44} className="text-indigo-500" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Student</p>

          {/* Info rows */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-400 shrink-0" />
              <span>Joined {joinDate}</span>
            </div>
            {profile.enrollments !== undefined && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <BookOpen size={16} className="text-gray-400 shrink-0" />
                <span>{profile.enrollments.length} course{profile.enrollments.length !== 1 ? "s" : ""} enrolled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
