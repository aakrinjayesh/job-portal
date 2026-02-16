import express from "express";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import {
  getFeatureUsage,
  getAIUsage,
  getLicenseOverview,
} from "../controllers/usageControllers.js";

const UsageRoute = express.Router();

UsageRoute.get("/usage", authenticateToken, getFeatureUsage);
UsageRoute.get("/ai-usage", authenticateToken, getAIUsage);
UsageRoute.get("/licenses", authenticateToken, getLicenseOverview);

export default UsageRoute;
