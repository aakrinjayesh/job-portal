import prisma from "../config/prisma.js";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/handleError.js";
import { getCandidateOtpEmailTemplate } from "../utils/emailTemplates/LoginTemplates.js";

// Generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 🔹 Controller: Send OTP

export const sendOtpController = async (req, res) => {
  try {
    logger.info("sendOtpController API hit");

    const { userProfileId, email } = req.body;
    if (!userProfileId) {
      logger.warn("userProfileId missing in request");
      return res
        .status(400)
        .json({ status: "failed", message: "userProfileId required" });
    }
    const user = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
    });

    if (!user) {
      logger.warn("Candidate not found:", user);
      return res
        .status(404)
        .json({ status: "failed", message: "Candidate not found" });
    }

    const otp = generateOtp();
    // const expiry = new Date(Date.now() + 5 * 60 * 1000);
    const expiry = new Date(Date.now() + 60 * 1000); // 60 seconds

    logger.info(`Generated OTP for ${user.email}`);

    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { verificationOtp: otp, otpExpiry: expiry },
    });
    const targetEmail = email || user.email; // 👈 IMPORTANT

    logger.info(`Generated OTP for ${targetEmail}`);

    const mailOptions = {
      to: targetEmail,
      subject: "Candidate Verification OTP",
      html: getCandidateOtpEmailTemplate(user.fullName, otp),
    };

    await sendEmail(mailOptions);
    logger.info(`OTP email sent to ${user.email}`);

    return res.json({ status: "success", message: "OTP sent successfully" });
  } catch (err) {
    logger.error(
      "Error in sendOtpController:",
      JSON.stringify(err.message, null, 2),
    );
    handleError(err, req, res);
    return res
      .status(500)
      .json({ status: "failed", message: "Failed to send OTP" });
  }
};

// 🔹 Controller: Verify OTP
export const verifyOtpController = async (req, res) => {
  try {
    logger.info("verifyOtpController API hit");

    const { userProfileId, otp } = req.body;

    const user = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
    });

    if (!user) {
      logger.warn("Candidate not found during OTP verification");
      return res
        .status(404)
        .json({ status: "failed", message: "Candidate not found" });
    }

    if (user.verificationOtp !== otp) {
      logger.warn("Invalid OTP entered");
      return res.status(400).json({ status: "failed", message: "Invalid OTP" });
    }

    const now = new Date();
    if (now > user.otpExpiry) {
      logger.warn("OTP expired");
      return res.status(400).json({ status: "failed", message: "OTP expired" });
    }

    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { isVerified: true, verificationOtp: null, otpExpiry: null },
    });
    logger.info(`OTP verified successfully for ${userProfileId}`);

    return res.json({ status: "success", message: "Verified successfully" });
  } catch (err) {
    logger.error(
      "Error in verifyOtpController:",
      JSON.stringify(err.message, null, 2),
    );
    handleError(err, req, res);
    return res
      .status(500)
      .json({ status: "failed", message: "Verification failed" });
  }
};


