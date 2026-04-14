import { Router } from "express";
import instructorAuthMiddleware from "../middlewares/instructorAuth";
import {
  AddCourse,
  DeleteCourse,
  GetCourse,
  GetCourses,
  Signin,
  Signup,
  UpdateCourse,
  getInstructor,
  getInstructorStudents,
} from "../controllers/instructor";

const router = Router();

// /instructor/signup
router.post("/signup", Signup);

// /instructor/signin
router.post("/signin", Signin);

// /instructor
router.get("/", instructorAuthMiddleware, getInstructor);

// /instructor/students
router.get("/students", instructorAuthMiddleware, getInstructorStudents);

// Add Course
router.post("/course", instructorAuthMiddleware, AddCourse);

// Update Course
router.put("/course/:id", instructorAuthMiddleware, UpdateCourse);

// Get Courses
router.get("/courses", instructorAuthMiddleware, GetCourses);

// Get Course
router.get("/course/:id", instructorAuthMiddleware, GetCourse);

// Delete Course
router.delete("/course/:id", instructorAuthMiddleware, DeleteCourse);

export default router;
