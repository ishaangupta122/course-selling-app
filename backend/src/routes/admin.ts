import { Router } from "express";
import {
  ApproveInstructor,
  BlockInstructor,
  GetPlatformStats,
  Signin,
  Signup,
  UnblockInstructor,
} from "../controllers/admin";
import adminAuthMiddleware from "../middlewares/adminAuth";

const router = Router();

// Signup
router.post("/signup", Signup);

// Signin
router.post("/signin", Signin);

// Moderate instructor accounts
router.patch(
  "/instructors/:instructorId/approve",
  adminAuthMiddleware,
  ApproveInstructor,
);
router.patch(
  "/instructors/:instructorId/block",
  adminAuthMiddleware,
  BlockInstructor,
);
router.patch(
  "/instructors/:instructorId/unblock",
  adminAuthMiddleware,
  UnblockInstructor,
);

// Platform stats
router.get("/stats", adminAuthMiddleware, GetPlatformStats);

export default router;
