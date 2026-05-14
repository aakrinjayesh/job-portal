import express from "express";
import { getSuggestedUsers, getUserProfile,getSuggestedCompanies,followCompany,unfollowCompany } from "../controllers/userController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
 

const userRoutes = express.Router();

 userRoutes.get("/suggested", authenticateToken, getSuggestedUsers);
 userRoutes.get("/suggested-companies", authenticateToken, getSuggestedCompanies);
 userRoutes.post("/follow-company", authenticateToken, followCompany);
 userRoutes.post("/unfollow-company", authenticateToken, unfollowCompany);
 userRoutes.get("/:userId", authenticateToken, getUserProfile);

export default userRoutes;