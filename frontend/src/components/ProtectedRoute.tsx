import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Which roles are allowed. If omitted, any authenticated user passes. */
  allowedRoles?: Array<"student" | "instructor" | "admin">;
  /** Where to redirect unauthenticated users (defaults by role or /instructor/signin) */
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Default redirect based on the route being accessed
    const fallback = redirectTo ?? "/instructor/signin";
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as any)) {
    // Authenticated but wrong role — send to their home
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "instructor")
      return <Navigate to="/instructor/dashboard" replace />;
    if (role === "student") return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
