import express from "express";
import { verifyAdminToken } from "../middleware/adminMiddleware.js";
import { adminCreateUser } from "../controllers/adminUserController.js";

const AdminUserRoute = express.Router();

// Admin routes — add your isAdmin middleware here when ready
AdminUserRoute.post("/create/user", verifyAdminToken, adminCreateUser);

export default AdminUserRoute;
