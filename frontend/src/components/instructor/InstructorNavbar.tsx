import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, BookOpen, UserRound, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useRecoilValue } from "recoil";
import { studentState } from "../../atoms";

const InstructorNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const student = useRecoilValue(studentState);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate("/signin");
  };

  const initials = student?.name
    ? student.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  const ProfileDropdown = () => (
    <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{student?.name ?? "Student"}</p>
          <p className="text-white/70 text-xs truncate">{student?.email ?? ""}</p>
        </div>
      </div>
      {/* Links */}
      <div className="py-1">
        <Link
          to="/enrolled-courses"
          onClick={() => setIsProfileDropdownOpen(false)}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <BookOpen size={15} className="text-gray-400" />
          My Courses
        </Link>
        <Link
          to="/profile"
          onClick={() => setIsProfileDropdownOpen(false)}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <UserRound size={15} className="text-gray-400" />
          Edit Profile
        </Link>
        <hr className="my-1 border-gray-100" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <nav className="lg:px-8 px-4 py-3">
      <div className="relative flex items-center justify-between rounded-2xl px-6 py-2">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://cdn-icons-png.flaticon.com/512/8238/8238761.png"
            alt="logo"
            className="max-w-[3rem]"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signup"
                className="text-white font-semibold bg-[#156FE6] hover:bg-black rounded-full py-2.5 px-6 transition-all duration-300"
              >
                Sign up
              </Link>
              <Link
                to="/signin"
                className="text-sm font-medium text-gray-600 hover:text-black border border-gray-200 rounded-full py-2.5 px-5 transition"
              >
                Sign in
              </Link>
            </>
          ) : (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-4 py-1 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {student?.name ?? "Profile"}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isProfileDropdownOpen && <ProfileDropdown />}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="block lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[62px] left-0 w-full bg-white z-50 shadow-xl rounded-2xl border border-gray-100 p-4 space-y-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center text-white font-semibold bg-[#156FE6] hover:bg-black rounded-xl py-3 px-6 transition"
                >
                  Sign up
                </Link>
                <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center text-sm font-medium text-gray-600 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                {/* Mini profile card */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{student?.name ?? "Student"}</p>
                    <p className="text-white/70 text-xs truncate">{student?.email ?? ""}</p>
                  </div>
                </div>
                <Link to="/enrolled-courses" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <BookOpen size={15} className="text-gray-400" /> My Courses
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <UserRound size={15} className="text-gray-400" /> Edit Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                  <LogOut size={15} /> Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default InstructorNavbar;
