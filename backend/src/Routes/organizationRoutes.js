import express from "express";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import { ensureCompanyAdmin } from "../Middleware/organizationMiddleware.js";
import {
  getOrganizationMembers,
  removeMember,
  deleteInviteByAdmin,
} from "../controllers/organizationController.js";
import {
  sendInvite,
  // acceptInvite,
  // rejectInvite,
} from "../controllers/inviteController.js";

const OrganizationRoutes = express.Router();

// General Organization Management
OrganizationRoutes.get("/members", authenticateToken, getOrganizationMembers);
OrganizationRoutes.post(
  "/member/remove",
  authenticateToken,
  ensureCompanyAdmin,
  removeMember,
);
OrganizationRoutes.post(
  "/invite/revoke",
  authenticateToken,
  ensureCompanyAdmin,
  deleteInviteByAdmin,
);

// Invite Flow — COMPANY_ADMIN only
OrganizationRoutes.post(
  "/invite",
  authenticateToken,
  ensureCompanyAdmin,
  sendInvite,
);
// OrganizationRoutes.get("/invite/reject", rejectInvite); // Public (Token based)
// OrganizationRoutes.post("/invite/validate", validateInvite); // Public (Token based)
// OrganizationRoutes.post("/invite/accept", acceptInvite); // Public (Token based)

export default OrganizationRoutes;
