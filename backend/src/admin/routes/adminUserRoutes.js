import express from "express";
import { verifyAdminToken } from "../middleware/adminMiddleware.js";
import { adminCreateUser,getUserByEmail,deleteUser } from "../controllers/adminUserController.js";

const AdminUserRoute = express.Router();

// Admin routes — add your isAdmin middleware here when ready
AdminUserRoute.post("/create/user", verifyAdminToken, adminCreateUser);
AdminUserRoute.get("/users/lookup",  verifyAdminToken, getUserByEmail);
AdminUserRoute.delete("/users/:id",  verifyAdminToken, deleteUser);

export default AdminUserRoute;
