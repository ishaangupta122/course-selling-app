import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, UserRound, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface AdminNavbarProps {
  adminName?: string;
  adminEmail?: string;
}

const AdminNavbar = ({ adminName, adminEmail }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    navigate("/admin/signin");
  };

  const initials = adminName
    ? adminName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const ProfileDropdown = () => (
    <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{adminName ?? "Admin"}</p>
          <p className="text-white/70 text-xs truncate">{adminEmail ?? ""}</p>
          <span className="inline-flex items-center gap-1 text-white/80 text-[10px] mt-0.5">
            <Shield size={9} /> Administrator
          </span>
        </div>
      </div>
      {/* Links */}
      <div className="py-1">
        <Link
          to="/admin/dashboard"
          onClick={() => setIsProfileDropdownOpen(false)}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <LayoutDashboard size={15} className="text-gray-400" />
          Dashboard
        </Link>
        <Link
          to="/admin/profile"
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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative flex items-center justify-between h-14">
          {/* Logo + brand */}
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </nav>

          {/* Profile button */}
          <div className="hidden lg:block" ref={profileRef}>
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-4 py-1 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {adminName ?? "Admin"}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isProfileDropdownOpen && <ProfileDropdown />}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button className="block lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{adminName ?? "Admin"}</p>
              <p className="text-white/70 text-xs truncate">{adminEmail ?? ""}</p>
              <span className="inline-flex items-center gap-1 text-white/80 text-[10px] mt-0.5">
                <Shield size={9} /> Administrator
              </span>
            </div>
          </div>
          <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <LayoutDashboard size={15} className="text-gray-400" /> Dashboard
          </Link>
          <Link to="/admin/profile" onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <UserRound size={15} className="text-gray-400" /> Edit Profile
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
