import { Router } from "express";
import {
  DeleteInstructor,
  DeleteStudent,
  GetAllInstructors,
  GetAllStudents,
  GetPlatformStats,
  GetProfile,
  Signin,
  Signup,
  UpdateProfile,
} from "../controllers/admin";
import adminAuthMiddleware from "../middlewares/adminAuth";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup", Signup);
router.post("/signin", Signin);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", adminAuthMiddleware, GetProfile);
router.put("/profile", adminAuthMiddleware, UpdateProfile);

// ─── Instructors ──────────────────────────────────────────────────────────────
router.get("/instructors", adminAuthMiddleware, GetAllInstructors);
router.delete("/instructors/:id", adminAuthMiddleware, DeleteInstructor);

// ─── Students ─────────────────────────────────────────────────────────────────
router.get("/students", adminAuthMiddleware, GetAllStudents);
router.delete("/students/:id", adminAuthMiddleware, DeleteStudent);

// ─── Platform Stats ───────────────────────────────────────────────────────────
router.get("/stats", adminAuthMiddleware, GetPlatformStats);

export default router;
