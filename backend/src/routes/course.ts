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

// Public routes
router.get("/", AllCourses);
router.get("/:id", GetCourse);

// Instructor routes
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

// Delete routes (instructor only)
router.delete("/folder/:folderId", instructorAuthMiddleware, DeleteFolder);
router.delete("/content/:contentId", instructorAuthMiddleware, DeleteContent);

// Reorder content within a folder
router.patch("/folder/:folderId/reorder", instructorAuthMiddleware, ReorderContent);

// Student routes
router.post("/enroll/:courseId", studentAuthMiddleware, EnrollInCourse);
router.post("/capturePayment", studentAuthMiddleware, CapturePayment);

export default router;
