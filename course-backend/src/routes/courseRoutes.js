import express from "express";
import multer from "multer";
import {
  authenticate,
  isInstructor,
  isAdmin,
} from "../Middleware/authMiddleware.js";
import {
  // S3
  getUploadUrl,
  // Course
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  getCourseBySlug,
  checkCourseSlug,
  updateCourse,
  publishCourse,
  deleteCourse,
  // Sections
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  // Lectures
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
  // Admin
  adminGetAllCourses,
  getCourseAnalytics,
} from "../controllers/courseController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── S3 Upload URL ─────────────────────────────────────────
// router.post("/upload-url", authenticate, isInstructor, getUploadUrl);
router.post(
  "/upload/thumbnail",
  authenticate,
  upload.single("file"),
  getUploadUrl,
);
router.post(
  "/upload/lecture",
  authenticate,
  upload.single("file"),
  getUploadUrl,
);
router.post(
  "/upload/certificate",
  authenticate,
  upload.single("file"),
  getUploadUrl,
);
router.post("/upload-url", getUploadUrl);

// ── Course ────────────────────────────────────────────────
router.get("/", getAllCourses); // public
router.get("/admin/all", authenticate, isAdmin, adminGetAllCourses);
router.get("/my", authenticate, isInstructor, getMyCourses);
router.get("/slug/:slug", getCourseBySlug); // public
router.get("/:id", getCourseById); // public
router.get("/check-slug/:slug", checkCourseSlug);
router.post("/", authenticate, isInstructor, createCourse);
router.put("/:id", authenticate, isInstructor, updateCourse);
router.patch("/:id/publish", authenticate, isInstructor, publishCourse);
router.delete("/:id", authenticate, isInstructor, deleteCourse);

// ── Sections ──────────────────────────────────────────────
router.post("/:courseId/sections", authenticate, isInstructor, createSection);
router.put(
  "/:courseId/sections/:sectionId",
  authenticate,
  isInstructor,
  updateSection,
);
router.delete(
  "/:courseId/sections/:sectionId",
  // authenticate,
  isInstructor,
  deleteSection,
);
router.patch(
  "/:courseId/sections/reorder",
  authenticate,
  isInstructor,
  reorderSections,
);

// ── Lectures ──────────────────────────────────────────────
router.post(
  "/:courseId/sections/:sectionId/lectures",
  authenticate,
  isInstructor,
  createLecture,
);
router.put(
  "/:courseId/sections/:sectionId/lectures/:lectureId",
  authenticate,
  isInstructor,
  updateLecture,
);
router.delete(
  "/:courseId/sections/:sectionId/lectures/:lectureId",
  authenticate,
  isInstructor,
  deleteLecture,
);
router.patch(
  "/:courseId/sections/:sectionId/lectures/reorder",
  authenticate,
  isInstructor,
  reorderLectures,
);
router.get("/:courseId/analytics", authenticate, getCourseAnalytics);

export default router;
