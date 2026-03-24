import express from "express";
import {
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getSubscriptionPlans,
  assignLicense,
  getOrgLicenses,
  getSubscriptionStatus,
  cancelSubscription,
  getUserLicenseTier,
  // reEnableAutoRenew,
} from "../controllers/billingController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
import { ensureCompanyAdmin } from "../Middleware/organizationMiddleware.js";

const BillingRoute = express.Router();

BillingRoute.get("/billing/plans", authenticateToken, getSubscriptionPlans);
BillingRoute.post("/billing/invoice", authenticateToken, createInvoice);

// Legacy one-time order flow (kept for backward compatibility)
BillingRoute.post(
  "/billing/razorpay/order",
  authenticateToken,
  createRazorpayOrder,
);
BillingRoute.post(
  "/billing/razorpay/verify",
  authenticateToken,
  verifyRazorpayPayment,
);

// License management — COMPANY_ADMIN only
BillingRoute.get(
  "/billing/licenses",
  authenticateToken,
  ensureCompanyAdmin,
  getOrgLicenses,
);
BillingRoute.post(
  "/billing/licenses/assign",
  authenticateToken,
  ensureCompanyAdmin,
  assignLicense,
);
// BillingRoute.post("/billing/reduce-seats", authenticateToken, ensureCompanyAdmin, reduceSeats);

// Subscription management
BillingRoute.get(
  "/billing/subscription",
  authenticateToken,
  getSubscriptionStatus,
);
BillingRoute.post(
  "/billing/subscription/cancel",
  authenticateToken,
  ensureCompanyAdmin,
  cancelSubscription,
);
BillingRoute.get(
  "/billing/user-license-tier",
  authenticateToken,
  getUserLicenseTier,
);
// BillingRoute.post(
//   "/billing/subscription/renew",
//   authenticateToken,
//   ensureCompanyAdmin,
//   reEnableAutoRenew,
// );

export default BillingRoute;
