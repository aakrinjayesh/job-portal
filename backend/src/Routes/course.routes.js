import express from "express";
import {
  uploadCourseVideo,
  createCourse,
  updateCourse,
  getCourseById,
  listAllCourses,
  deleteCourse
} from "../controllers/course.controller.js";

import { authenticateToken } from '../Middleware/authMiddleware.js';
import multerCMS from "../Middleware/multer.js";

const { uploadVideo } = multerCMS;


const router = express.Router();

// ------------------------------
// COURSE MANAGEMENT ROUTES
// ------------------------------

// Upload a single course video
router.post(
  "/upload-video",
  uploadVideo.single("video"),
  uploadCourseVideo
);

// Create a course (after videos uploaded)
router.post("/create", authenticateToken,createCourse);

// Update existing course
router.put("/update/:courseId", updateCourse);

// Get single course
router.get("/get/:courseId", getCourseById);

// List all courses
router.get("/all", listAllCourses);

// Delete a course
router.delete("/delete/:courseId", deleteCourse);

export default router;
