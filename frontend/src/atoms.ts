import { atom, selector } from "recoil";
import { Instructor, Student, Admin } from "./utils/types";

export type UserRole = "student" | "instructor" | "admin" | null;

// ─── Instructor ───────────────────────────────────────────────────────────────

export const instructorState = atom<Instructor | null>({
  key: "instructorState",
  default: null,
});

export const currentInstructorState = atom<Instructor | null>({
  key: "currentInstructorState",
  default: null,
});

// ─── Student ──────────────────────────────────────────────────────────────────

export const studentState = atom<Student | null>({
  key: "studentState",
  default: null,
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminState = atom<Admin | null>({
  key: "adminState",
  default: null,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const tokenState = atom<string | null>({
  key: "tokenState",
  default: localStorage.getItem("token"),
});

export const roleState = atom<UserRole>({
  key: "roleState",
  default: localStorage.getItem("role") as UserRole,
});

export const isAuthenticatedSelector = selector<boolean>({
  key: "isAuthenticated",
  get: ({ get }) => {
    const token = get(tokenState);
    return !!token;
  },
});
