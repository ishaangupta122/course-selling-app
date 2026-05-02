import { Router } from "express";
import studentAuthMiddleware from "../middlewares/studentAuth";
import {
  CheckEnrollment,
  getEnrolledCourse,
  getEnrolledCourses,
  GetProfile,
  Signin,
  Signup,
  UpdateProfile,
} from "../controllers/student";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup", Signup);
router.post("/signin", Signin);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", studentAuthMiddleware, GetProfile);
router.put("/profile", studentAuthMiddleware, UpdateProfile);

// All Enrolled Courses
router.get("/courses", studentAuthMiddleware, getEnrolledCourses);

// Single Enrolled Course
router.get("/courses/:courseId", studentAuthMiddleware, getEnrolledCourse);

// Check Enrollment
router.get("/:courseId", studentAuthMiddleware, CheckEnrollment);

export default router;
