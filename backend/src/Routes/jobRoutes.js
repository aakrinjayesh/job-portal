import express from "express";
import {
  getJobList,
  postJob,
  userApplyJob,
  // userWithdrawJob,
  userSaveJob,
  userAllApplyedJobs,
  userAllSavedJobs,
  postedJobs,
  editJob,
  deleteJob,
  getJobDetails,
  getApplicantsByJobId,
  getUserAppliedJobsId,
  userUnsaveJob,
  saveCandidateRating,
  closeJob,
} from "../controllers/jobControllers.js";
import { validateInput } from "../Middleware/inputValidator.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import { ensureCompanyMember } from "../Middleware/organizationMiddleware.js";

import {
  getJobListValidator,
  postJobValidator,
  applyJobValidator,
  withdrawJobValidator,
  saveJobValidator,
  removeSavedJobValidator,
  editJobValidator,
  deleteJobValidator,
  postedJobValidator,
  getJobDeatilsValidator,
} from "../validators/userValidators.js";
import { featureLimitMiddleware } from "../Middleware/featureLimitMiddleware.js";

const JobRouters = express.Router();

// Public job routes
JobRouters.post(
  "/jobs/list",
  // validateInput(getJobListValidator),
  authenticateToken,
  getJobList,
);
JobRouters.get(
  "/job/:jobId",
  // validateInput(getJobDeatilsValidator),
  // authenticateToken,
  getJobDetails,
);

// User job application routes
JobRouters.post(
  "/jobs/apply",
  validateInput(applyJobValidator),
  authenticateToken,
  userApplyJob,
);
// JobRouters.delete('/jobs/:jobId/withdraw', validateInput(withdrawJobValidator), authenticateToken, userWithdrawJob)
JobRouters.get("/jobs/applied/all", authenticateToken, userAllApplyedJobs);
JobRouters.get("/job/applied/ids", authenticateToken, getUserAppliedJobsId);

// User saved jobs routes
JobRouters.post(
  "/jobs/save",
  // validateInput(saveJobValidator),
  authenticateToken,
  userSaveJob,
);

JobRouters.post(
  "/jobs/unsave",
  // validateInput(removeSavedJobValidator),
  authenticateToken,
  userUnsaveJob,
);
JobRouters.get("/jobs/saved", authenticateToken, userAllSavedJobs);

// Company/Vendor job management routes

JobRouters.post(
  "/jobs/create",
  validateInput(postJobValidator),
  authenticateToken,
  ensureCompanyMember,
  featureLimitMiddleware,
  postJob,
);
JobRouters.get(
  "/jobs/posted",
  // validateInput(postedJobValidator),
  authenticateToken,
  postedJobs,
);
JobRouters.post(
  "/jobs/update",
  validateInput(editJobValidator),
  authenticateToken,
  ensureCompanyMember,
  editJob,
);
JobRouters.delete(
  "/jobs/delete",
  validateInput(deleteJobValidator),
  authenticateToken,
  ensureCompanyMember,
  deleteJob,
);
JobRouters.patch(
  "/jobs/close/:jobId",
  authenticateToken,
  ensureCompanyMember,
  closeJob,
);

JobRouters.post("/job/applicants", authenticateToken, getApplicantsByJobId);

JobRouters.post(
  "/candidate/rating",
  authenticateToken,
  ensureCompanyMember,
  saveCandidateRating,
);

export default JobRouters;
