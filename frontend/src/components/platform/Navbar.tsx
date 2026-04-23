import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useRecoilValue } from "recoil";
import { instructorState } from "../../atoms";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const instructor = useRecoilValue(instructorState);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigninDropdownOpen, setIsSigninDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const signupRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (signupRef.current && !signupRef.current.contains(e.target as Node)) {
        setIsSigninDropdownOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
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
    navigate("/instructor/signin");
  };

  // Initials avatar helper
  const initials = instructor?.name
    ? instructor.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "IN";

  // Profile card dropdown (desktop)
  const ProfileDropdown = () => (
    <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {instructor?.name ?? "Instructor"}
          </p>
          <p className="text-white/70 text-xs truncate">
            {instructor?.email ?? ""}
          </p>
        </div>
      </div>
      {/* Links */}
      <div className="py-1">
        <Link
          to="/instructor/dashboard"
          onClick={() => setIsProfileDropdownOpen(false)}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
          <LayoutDashboard size={15} className="text-gray-400" />
          Dashboard
        </Link>
        <Link
          to="/instructor/profile"
          onClick={() => setIsProfileDropdownOpen(false)}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
          <UserRound size={15} className="text-gray-400" />
          Edit Profile
        </Link>
        <hr className="my-1 border-gray-100" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <nav className="lg:px-8 px-4 pt-4">
      <div
        className={`relative flex items-center justify-between rounded-2xl px-6 py-3 ${
          isAuthenticated
            ? "border-none"
            : "border border-dashed border-[#ed7e07]"
        }`}>
        {/* Logo */}
        <Link to={isAuthenticated ? "/instructor/dashboard" : "/"}>
          <img src="/courses_logo.png" alt="logo" className="max-w-[3rem]" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              {/* Signup */}
              <Link
                to="/instructor/signup"
                className="text-white font-semibold bg-[#ef5332] hover:bg-black rounded-full py-2.5 px-5 transition-all duration-300">
                Signup as Instructor
              </Link>

              <div ref={signupRef} className="relative">
                <button
                  onClick={() => setIsSigninDropdownOpen(!isSigninDropdownOpen)}
                  className="flex items-center gap-2 text-white font-semibold bg-[#ef5332] hover:bg-black rounded-full py-2.5 px-5 transition-all duration-300">
                  Signin
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${isSigninDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSigninDropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/instructor/signin"
                      onClick={() => setIsSigninDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <span>As Instructor</span>
                    </Link>
                    <Link
                      to="/admin/signin"
                      onClick={() => setIsSigninDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-100">
                      <span>As Admin</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Profile button + dropdown */
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-4 py-1 hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {instructor?.name ?? "Profile"}
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
        <button
          className="block lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[62px] left-0 w-full bg-white z-50 shadow-xl rounded-2xl border border-gray-100 p-4 space-y-3">
            {!isAuthenticated ? (
              <>
                <Link to="#" className="block font-medium text-gray-700 py-2">
                  Features
                </Link>
                <Link to="#" className="block text-[#ed7e07] font-medium py-2">
                  Success Stories
                </Link>
                <hr className="border-gray-100" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Sign up as
                </p>
                <Link
                  to="/instructor/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                  Instructor <ChevronRight size={14} />
                </Link>
                <Link
                  to="/admin/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                  Admin <ChevronRight size={14} />
                </Link>
                <Link
                  to="/instructor/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center text-sm font-medium text-gray-600 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                {/* Mini profile card in mobile */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {instructor?.name ?? "Instructor"}
                    </p>
                    <p className="text-white/70 text-xs truncate">
                      {instructor?.email ?? ""}
                    </p>
                  </div>
                </div>
                <Link
                  to="/instructor/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <LayoutDashboard size={15} className="text-gray-400" />{" "}
                  Dashboard
                </Link>
                <Link
                  to="/instructor/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <UserRound size={15} className="text-gray-400" /> Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
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

export default Navbar;
