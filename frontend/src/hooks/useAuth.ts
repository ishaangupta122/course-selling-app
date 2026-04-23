import { useRecoilState, useRecoilValue } from "recoil";
import {
  instructorState,
  studentState,
  tokenState,
  isAuthenticatedSelector,
  roleState,
  UserRole,
} from "../atoms";
import { instructorSignin, instructorSignup, studentSignin } from "../api/auth";
import { adminSignin, adminSignup } from "../api/admin";
import { AuthResponse, StudentAuthResponse } from "../utils/types";

export const useAuth = () => {
  const [instructor, setInstructor] = useRecoilState(instructorState);
  const [student, setStudent] = useRecoilState(studentState);
  const [token, setToken] = useRecoilState(tokenState);
  const [role, setRole] = useRecoilState(roleState);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);

  const setAuth = (token: string, userRole: UserRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole ?? "");
    setToken(token);
    setRole(userRole);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    setInstructor(null);
    setStudent(null);
  };

  // ─── Instructor ────────────────────────────────────────────────────────────

  const signin = async (email: string, password: string) => {
    try {
      const data: AuthResponse = await instructorSignin({ email, password });
      setAuth(data.token, "instructor");
      setInstructor(data.instructor);
      return data;
    } catch (error) {
      console.error("Signin error:", error);
      throw error;
    }
  };

  const signup = async (signupData: {
    name: string;
    email: string;
    password: string;
    organization: string;
  }) => {
    try {
      const data: AuthResponse = await instructorSignup(signupData);
      setAuth(data.token, "instructor");
      setInstructor(data.instructor);
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // ─── Student ───────────────────────────────────────────────────────────────

  const studentLogin = async (email: string, password: string) => {
    try {
      const data: StudentAuthResponse = await studentSignin({ email, password });
      setAuth(data.token, "student");
      setStudent(data.student);
      return data;
    } catch (error) {
      console.error("Student signin error:", error);
      throw error;
    }
  };

  // ─── Admin ─────────────────────────────────────────────────────────────────

  const adminLogin = async (email: string, password: string) => {
    try {
      const data = await adminSignin({ email, password });
      setAuth(data.token, "admin");
      return data;
    } catch (error) {
      console.error("Admin signin error:", error);
      throw error;
    }
  };

  const adminRegister = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const data = await adminSignup(payload);
      setAuth(data.token, "admin");
      return data;
    } catch (error) {
      console.error("Admin signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  return {
    instructor,
    student,
    isAuthenticated,
    token,
    role,
    signin,
    signup,
    studentLogin,
    adminLogin,
    adminRegister,
    logout,
  };
};
