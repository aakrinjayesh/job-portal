import express from "express";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import {
    getOrganizationMembers,
    removeMember,
    deleteInviteByAdmin
} from "../controllers/organizationController.js";
// import {
//     sendInvite,
//     rejectInvite,
//     validateInvite,
//     acceptInvite
// } from "../controllers/inviteController.js";
import { sendInvite, acceptInvite, rejectInvite } from "../controllers/inviteController.js";

const OrganizationRoutes = express.Router();

// General Organization Management
OrganizationRoutes.get("/members", authenticateToken, getOrganizationMembers);
OrganizationRoutes.post("/member/remove", authenticateToken, removeMember);
OrganizationRoutes.post("/invite/revoke", authenticateToken, deleteInviteByAdmin);

// Invite Flow
OrganizationRoutes.post("/invite", authenticateToken, sendInvite);
OrganizationRoutes.get("/invite/reject", rejectInvite); // Public (Token based)
// OrganizationRoutes.post("/invite/validate", validateInvite); // Public (Token based)
OrganizationRoutes.post("/invite/accept", acceptInvite); // Public (Token based)

export default OrganizationRoutes;
