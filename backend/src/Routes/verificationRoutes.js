import express from "express";
import { sendOtpController, verifyOtpController } from "../controllers/verificationController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
 
const router = express.Router();
 
// Send OTP to candidate’s email
router.post("/send-otp", authenticateToken, sendOtpController);
 
// Verify OTP entered by candidate
router.post("/verify-otp", authenticateToken, verifyOtpController);
 
export default router;