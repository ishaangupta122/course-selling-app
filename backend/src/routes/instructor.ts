import { Router } from "express";
import instructorAuthMiddleware from "../middlewares/instructorAuth";
import {
  AddCourse,
  DeleteCourse,
  GetCourse,
  GetCourses,
  GetProfile,
  Signin,
  Signup,
  UpdateCourse,
  UpdateProfile,
  getInstructorStudents,
} from "../controllers/instructor";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup", Signup);
router.post("/signin", Signin);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", instructorAuthMiddleware, GetProfile);
router.put("/profile", instructorAuthMiddleware, UpdateProfile);

// ─── Students ─────────────────────────────────────────────────────────────────
router.get("/students", instructorAuthMiddleware, getInstructorStudents);

// ─── Courses ──────────────────────────────────────────────────────────────────
router.get("/courses", instructorAuthMiddleware, GetCourses);
router.post("/course", instructorAuthMiddleware, AddCourse);
router.get("/course/:id", instructorAuthMiddleware, GetCourse);
router.put("/course/:id", instructorAuthMiddleware, UpdateCourse);
router.delete("/course/:id", instructorAuthMiddleware, DeleteCourse);

export default router;
