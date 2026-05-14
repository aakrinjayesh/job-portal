import express from "express";
import { getFeed } from "../controllers/feedController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";

const feedRoutes = express.Router();

// GET /api/feed
feedRoutes.get("", authenticateToken, getFeed);

export default feedRoutes;