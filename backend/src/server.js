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
// import billingRoutes from "./Routes/billingRoutes.js";

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
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

app.use("/api/activity", activityRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(authLimiter, LoginRouters);
app.use(userRouter);
app.use(JobRouters);
app.use(CommonRouters);
app.use("/vendor", VendorRoutes);
app.use("/verification", VerificationRoutes);
// app.use(authenticateToken, aiUserLimiter, CVRouters);
app.use(authenticateToken, CVRouters);
app.use("/api/todos", todoRoutes);
app.use("/api/v1/organization", OrganizationRoutes);

const PORT = process.env.PORT;

app.listen(PORT || "3001", () => {
  // console.log(`server Started at http://localhost:${PORT}`);
  logger.info(
    `server Started at ${process.env.BACKEND_URL || "http://localhost:"}:${PORT}`,
  );
});
