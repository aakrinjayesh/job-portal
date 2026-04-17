// src/routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAdminStats,
  executeQuery, getAllOrganizations,
  getOrganizationById,
  deleteOrganization,
  removeMember,
  getPlanLimits,
  upsertPlanLimit,
  bulkUpsertPlanLimits,
  deletePlanLimit,
  updatePlanPricing, 
  adminPostJob
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

// ── Plan Limits ───────────────────────────────────
Adminrouter.get("/plan-limits", verifyAdminToken, getPlanLimits);          // all plans + their limits
Adminrouter.post("/plan-limits", verifyAdminToken, upsertPlanLimit);       // create or update one limit
Adminrouter.post("/plan-limits/bulk", verifyAdminToken, bulkUpsertPlanLimits); // update many at once
Adminrouter.delete("/plan-limits/:id", verifyAdminToken, deletePlanLimit); // remove one limit

// ── Plan Pricing ──────────────────────────────────
Adminrouter.patch("/plans/:planId/pricing", verifyAdminToken, updatePlanPricing);

// ── Jobs ──────────────────────────────────────────
Adminrouter.post("/jobs", verifyAdminToken, adminPostJob);



// Protected — add verifyAdminToken to any admin-only route
// Adminrouter.post("/user/create", verifyAdminToken, getAdminDashboard);

export default Adminrouter;
