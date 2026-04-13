import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { logger } from "./utils/logger.js";
import {
  apiLimiter,
  authLimiter,
  aiLimiter,
} from "./Middleware/rateLimiter.js";

import { aiUserLimiter } from "./Middleware/aiRateLimiter.js";

import userRouter from "./Routes/profileRoutes.js";
import JobRouters from "./Routes/jobRoutes.js";
import CommonRouters from "./Routes/commonRoutes.js";
import LoginRouters from "./Routes/loginRoutes.js";
import VendorRoutes from "./Routes/vendorRoutes.js";
import VerificationRoutes from "./Routes/verificationRoutes.js";
import CVRouters from "./Routes/cvRankerRoutes.js";
import activityRoutes from "./Routes/activityRoutes.js";
import { authenticateToken } from "./Middleware/authMiddleware.js";
import todoRoutes from "./Routes/todoRoutes.js";
import OrganizationRoutes from "./Routes/organizationRoutes.js";
import cookieParser from "cookie-parser";
import BillingRoute from "./Routes/billingRoutes.js";
import RenewalRoute from "./Routes/renewalRoutes.js";
import { featureLimitMiddleware } from "./Middleware/featureLimitMiddleware.js";
import UsageRoute from "./Routes/usageRoutes.js";
import seoRoute from "./Routes/seoRoutes.js";
import SupportRoutes from "./Routes/supportRoutes.js";
import { startLicenseReminderCron } from "./cron/licenseReminderCron.js";
import { startJobNotificationCron } from "./cron/jobNotificationCron.js";
import AdminRoutes from "./admin.js";
import companyRouter from "./Routes/companyRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

console.log("allowed Domains", allowedOrigins || null);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// AUTO-PAY DISABLED — webhook raw body middleware disabled
// app.use("/billing/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(authLimiter, LoginRouters);
app.use(BillingRoute);
app.use(RenewalRoute);
app.use(seoRoute);
app.use("/api/activity", activityRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(userRouter);
app.use(CommonRouters);
app.use(SupportRoutes);
app.use("/verification", VerificationRoutes);
app.use(UsageRoute);
app.use(JobRouters);
// app.use("/api/support", SupportRoutes);
app.use("/vendor", VendorRoutes);
app.use(authenticateToken, featureLimitMiddleware, CVRouters);
app.use("/api/todos", todoRoutes);
app.use("/organization", OrganizationRoutes);
// app.use(authenticateToken, featureLimitMiddleware); // there are few api with no authentication look

app.use("/admin", AdminRoutes);
app.use("/api/companies", companyRouter);

const PORT = process.env.PORT;

app.listen(PORT || "3001", () => {
  // console.log(`server Started at http://localhost:${PORT}`);
  logger.info(
    `server Started at ${process.env.BACKEND_URL || "http://localhost:"}:${PORT}`,
  );
  startLicenseReminderCron();
  startJobNotificationCron();
});
