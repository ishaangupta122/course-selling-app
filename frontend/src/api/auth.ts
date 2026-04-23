import { apiClient } from "./client";
import { AuthResponse, StudentAuthResponse } from "../utils/types";

// ─── Instructor Auth ──────────────────────────────────────────────────────────

export const instructorSignup = async (payload: {
  name: string;
  email: string;
  password: string;
  organization: string;
}) => {
  const { data } = await apiClient.post<AuthResponse>(
    "/instructor/signup",
    payload,
  );
  return data;
};

export const instructorSignin = async (payload: {
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<AuthResponse>(
    "/instructor/signin",
    payload,
  );
  return data;
};

// ─── Student Auth ─────────────────────────────────────────────────────────────

export const studentSignup = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<StudentAuthResponse>(
    "/student/signup",
    payload,
  );
  return data;
};

export const studentSignin = async (payload: {
  email: string;
  password: string;
}) => {
  const { data } = await apiClient.post<StudentAuthResponse>(
    "/student/signin",
    payload,
  );
  return data;
};
