// src/routes/adminRoutes.js
import express from "express";
import { adminLogin, getAdminStats } from "../../admin/controllers/adminController.js";
import { verifyAdminToken } from "../../admin/middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.post("/login", adminLogin);
router.get("/stats", verifyAdminToken, getAdminStats);

// Protected — add verifyAdminToken to any admin-only route
// router.post("/user/create", verifyAdminToken, getAdminDashboard);

export default router;