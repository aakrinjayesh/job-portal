import express from "express";
import {
  AICandidateSearch,
  AIJobSearch,
  cvEligibilityCheck,
  generateJobDescription,
} from "../controllers/cvRankerControllers.js";
import { cvRankerValidator } from "../validators/userValidators.js";
import { validateInput } from "../Middleware/inputValidator.js";
import multer from "multer";
import { UploadResume } from "../controllers/profileControllers.js";

const CVRouters = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 🔥 Increased to 5MB (200KB is too small for PDF/DOC)
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only JPG, JPEG, PNG, PDF, DOC, DOCX files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

CVRouters.post("/upload", upload.single("file"), UploadResume);

CVRouters.post(
  "/check-eligibility",
  validateInput(cvRankerValidator),
  cvEligibilityCheck,
);

// ai job Descrition
CVRouters.post("/generate-jd", generateJobDescription);

CVRouters.post("/ai-candidate-filter", AICandidateSearch);

CVRouters.post("/ai-job-filter", AIJobSearch);

export default CVRouters;
