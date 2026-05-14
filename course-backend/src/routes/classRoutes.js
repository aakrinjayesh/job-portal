import express from "express";
import { authenticate } from "../Middleware/authMiddleware.js";
import {
  // Enrollment
  enrollCourse,
  getMyEnrollments,
  getEnrollmentStatus,
  // Progress
  updateLectureProgress,
  getCourseProgress,
  // Cart
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/classController.js";

const router = express.Router();

// All class routes require authentication
router.use(authenticate);

// ── Enrollment ────────────────────────────────────────────
router.post("/enroll/:courseId", enrollCourse);
router.get("/my-courses", getMyEnrollments);
router.get("/enrollment/:courseId", getEnrollmentStatus);

// ── Progress ──────────────────────────────────────────────
router.post("/progress", updateLectureProgress);
router.get("/progress/:courseId", getCourseProgress);

// ── Cart ──────────────────────────────────────────────────
router.get("/cart", getCart);
router.post("/cart/add", addToCart);
router.delete("/cart/clear", clearCart);
router.delete("/cart/:courseId", removeFromCart);

// ── Wishlist ──────────────────────────────────────────────
router.get("/wishlist", getWishlist);
router.post("/wishlist/add", addToWishlist);
router.delete("/wishlist/:courseId", removeFromWishlist);

export default router;
