// src/routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAdminStats,
} from "../../admin/controllers/adminController.js";
import { verifyAdminToken } from "../../admin/middleware/adminMiddleware.js";

const Adminrouter = express.Router();

// Public
Adminrouter.post("/login", adminLogin);
Adminrouter.get("/stats", verifyAdminToken, getAdminStats);

// Protected — add verifyAdminToken to any admin-only route
// Adminrouter.post("/user/create", verifyAdminToken, getAdminDashboard);

export default Adminrouter;
