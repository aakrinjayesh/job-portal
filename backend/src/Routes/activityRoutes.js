import express from "express";
import {
  createActivity,
  getMyActivity,
  getCandidateActivities,
  updateActivity,
  deleteActivity
} from "../controllers/activityControllers.js";

import { authenticateToken } from "../Middleware/authMiddleware.js";
console.log("✅ activityRoutes.js loaded"); // 👈 ADD HERE

const router = express.Router();

/**
 * All routes are protected
 * req.user is available from authenticateToken middleware
 */

// CREATE Activity (NOTE / SCHEDULE)
router.post(
  "/",
  authenticateToken,
  createActivity
);

// GET My Activity (Grouped by candidate)
router.get(
  "/my-activity",
  authenticateToken,
  getMyActivity
);

// GET Activity Timeline for a Candidate
router.get(
  "/candidate/:candidateId",
  authenticateToken,
  getCandidateActivities
);

// UPDATE Activity (NOTE / SCHEDULE)
router.put(
  "/:activityId",
  authenticateToken,
  updateActivity
);

// DELETE Activity (Hard delete)
router.delete(
  "/:activityId",
  authenticateToken,
  deleteActivity
);

export default router;
