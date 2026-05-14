import express from "express";
import { authenticate, isInstructor } from "../Middleware/authMiddleware.js";
import {
  // Assessment
  createOrUpdateAssessment,
  getAssessment,
  deleteAssessment,
  // Attempts
  submitAssessment,
  getMyAttempts,
  getAttemptsByInstructor,
  // Certificates
  getMyCertificate,
  getAllMyCertificates,
  getCertificateUploadUrl,
  updateCertificateUrl,
} from "../controllers/reviewController.js";

const router = express.Router();

router.use(authenticate);

// ── Assessment ────────────────────────────────────────────
router.post("/assessment/:courseId", isInstructor, createOrUpdateAssessment);
router.get("/assessment/:courseId", getAssessment); // candidate + instructor
router.delete("/assessment/:courseId", isInstructor, deleteAssessment);

// ── Attempts ──────────────────────────────────────────────
router.post("/attempt/:courseId", submitAssessment); // candidate submits
router.get("/attempts/:courseId", getMyAttempts); // candidate: own attempts
router.get(
  "/attempts/instructor/:courseId",
  isInstructor,
  getAttemptsByInstructor,
); // instructor analytics

// ── Certificates ──────────────────────────────────────────
router.get("/certificates/my", getAllMyCertificates);
router.get("/certificate/:courseId", getMyCertificate);
router.post("/certificate/upload-url", isInstructor, getCertificateUploadUrl);
router.patch("/certificate/:courseId/url", isInstructor, updateCertificateUrl);

export default router;
