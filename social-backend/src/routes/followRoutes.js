import express from "express";
import { followUser, unfollowUser } from "../controllers/followController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";

const followRoutes = express.Router();

// POST /api/follow    body: { targetUserId }
followRoutes.post("/users/:userId/follow", authenticateToken, followUser);

// POST /api/unfollow  body: { targetUserId }
followRoutes.post("/unfollow", authenticateToken, unfollowUser);

export default followRoutes;