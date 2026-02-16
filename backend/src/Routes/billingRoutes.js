import express from "express";
import {
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getSubscriptionPlans,
} from "../controllers/billingController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";

const BillingRoute = express.Router();

BillingRoute.get("/billing/plans", authenticateToken, getSubscriptionPlans);
BillingRoute.post("/billing/invoice", authenticateToken, createInvoice);
BillingRoute.post("/billing/razorpay/order", createRazorpayOrder);
BillingRoute.post("/billing/razorpay/verify", verifyRazorpayPayment);

export default BillingRoute;
