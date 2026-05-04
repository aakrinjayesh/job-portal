import { Router } from "express";
import {
  getReviewsByCourse,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = Router();

router.get("/course/:courseId", getReviewsByCourse);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
