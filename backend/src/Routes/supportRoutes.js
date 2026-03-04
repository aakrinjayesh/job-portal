import express from "express";

import {
  createSupportMessage,
//   getAllSupportMessages,
//   getSupportMessageById,
//   updateSupportStatus,
//   deleteSupportMessage,
} from "../controllers/supportControllers.js";

import { validateInput } from "../Middleware/inputValidator.js";
// import { authenticateToken } from "../Middleware/authMiddleware.js";
import { ensureCompanyMember } from "../Middleware/organizationMiddleware.js";



const SupportRouters = express.Router();


// ===============================
// Public / User routes
// ===============================

// Create support message (Contact / Support form)
SupportRouters.post(
  "/support/create",
  // validateInput,
  //authenticateToken,
  createSupportMessage
);




// ===============================
// Admin routes
// ===============================




export default SupportRouters;