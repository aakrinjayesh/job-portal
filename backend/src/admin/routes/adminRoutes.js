// src/routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAdminStats,
  executeQuery, getAllOrganizations,
  getOrganizationById,
  deleteOrganization,
  removeMember
} from "../../admin/controllers/adminController.js";
import { verifyAdminToken } from "../../admin/middleware/adminMiddleware.js";
// import { generateQueryFromPrompt } from "../controllers/adminQueryController.js";

const Adminrouter = express.Router();

// Public
Adminrouter.post("/login", adminLogin);
Adminrouter.get("/stats", verifyAdminToken, getAdminStats);
// src/admin/routes/adminRoutes.js
// Adminrouter.post("/generate-query", verifyAdminToken, generateQueryFromPrompt);


Adminrouter.post("/query", verifyAdminToken, executeQuery);
Adminrouter.get("/organizations", verifyAdminToken, getAllOrganizations);
Adminrouter.get("/organizations/:id", verifyAdminToken, getOrganizationById);
Adminrouter.delete("/organizations/:id", verifyAdminToken, deleteOrganization);
// router.patch("/organizations/:id/subscription", verifyAdminToken, updateSubscriptionStatus);
Adminrouter.delete("/organizations/members/:memberId", verifyAdminToken, removeMember);


// Protected — add verifyAdminToken to any admin-only route
// Adminrouter.post("/user/create", verifyAdminToken, getAdminDashboard);

export default Adminrouter;
