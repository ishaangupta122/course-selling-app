import { Router } from "express";
import {
  AllCourses,
  CapturePayment,
  CreateFolder,
  DeleteContent,
  DeleteFolder,
  EnrollInCourse,
  GetCourse,
  ListFolderContents,
  ReorderContent,
  UploadVideo,
} from "../controllers/course";
import studentAuthMiddleware from "../middlewares/studentAuth";
import instructorAuthMiddleware from "../middlewares/instructorAuth";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/", AllCourses);
router.get("/:id", GetCourse);

// ─── Instructor — Folders & Content ──────────────────────────────────────────
router.post("/createFolder/:courseId", instructorAuthMiddleware, CreateFolder);
router.post(
  "/uploadVideo",
  upload.single("video"),
  instructorAuthMiddleware,
  UploadVideo,
);
router.get(
  "/videos/:courseId/:folderName",
  instructorAuthMiddleware,
  ListFolderContents,
);
router.delete("/folder/:folderId", instructorAuthMiddleware, DeleteFolder);
router.delete("/content/:contentId", instructorAuthMiddleware, DeleteContent);

// NOTE: ReorderContent returns 501 until a `position` column is added to course_contents
router.patch("/folder/:folderId/reorder", instructorAuthMiddleware, ReorderContent);

// ─── Student — Enrollment & Payment ──────────────────────────────────────────
router.post("/enroll/:courseId", studentAuthMiddleware, EnrollInCourse);
router.post("/capturePayment", studentAuthMiddleware, CapturePayment);

export default router;
