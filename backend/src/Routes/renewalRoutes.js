import express from "express";
import {
  getRenewalInfo,
  createRenewalOrder,
  verifyRenewalPayment,
} from "../controllers/renewalController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import { ensureCompanyAdmin } from "../Middleware/organizationMiddleware.js";

const RenewalRoute = express.Router();

// GET  /billing/renew        — fetch current licenses + pricing for renewal page
// POST /billing/renew/order  — create Razorpay order for renewal
// POST /billing/renew/verify — verify payment and update license validity
RenewalRoute.get("/billing/renew", authenticateToken, ensureCompanyAdmin, getRenewalInfo);
RenewalRoute.post("/billing/renew/order", authenticateToken, ensureCompanyAdmin, createRenewalOrder);
RenewalRoute.post("/billing/renew/verify", authenticateToken, ensureCompanyAdmin, verifyRenewalPayment);

export default RenewalRoute;
