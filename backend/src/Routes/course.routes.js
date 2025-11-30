import express from "express";
import {
  createLearningCourse,
  upsertLearningCourse,
  deleteLearningCourse,
  getAllLearningCourses,
  getLearningCourseById,
  createClass,
} from "../controllers/learningCourse.controller.js";

import { authenticateToken } from "../Middleware/authMiddleware.js";
import multerConfig from "../Middleware/multer.js"
const router = express.Router();

// ------------------------------
// COURSE MANAGEMENT ROUTES
// ------------------------------

// Create a new course
router.post("/create", authenticateToken, createLearningCourse);

// Upsert (update if exists, else create) a course
router.put("/update/:courseId", authenticateToken, upsertLearningCourse);

// Get single course by ID
router.get("/get/:courseId", authenticateToken, getLearningCourseById);

// Get all courses for logged-in user
router.get("/all", authenticateToken, getAllLearningCourses);

// Delete a course along with its classes
router.delete("/delete/:courseId", authenticateToken, deleteLearningCourse);

// ------------------------------
// CLASS MANAGEMENT ROUTES
// ------------------------------

// Add one or multiple classes to a course
router.post("/classes", authenticateToken, createClass);

export const uploadLearningItem = (req, res) => {
  console.log("Received file:", req.file);

  if (!req.file) {
    return res.status(400).json({ status: "failed", message: "No file uploaded" });
  }

  // Determine folder dynamically based on multer's fieldname
  let folder = "videos"; // default
  if (req.file.fieldname === "image") folder = "images";
  else if (req.file.fieldname === "pdf") folder = "docs";

  // Create proper public URL
  const fileUrl = `uploads/${folder}/${req.file.filename}`;

  res.status(200).json({
    status: "success",
    url: fileUrl
  });
};


// Video
router.post("/upload-video", multerConfig.uploadVideo.single("video"), uploadLearningItem);

// PDF
router.post("/upload-pdf", multerConfig.uploadPdf.single("pdf"), uploadLearningItem);

// Image
router.post("/upload-image", multerConfig.uploadImage.single("image"), uploadLearningItem);
export default router;
