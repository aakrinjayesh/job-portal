import prisma from "../config/prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
 
dotenv.config();
 
// Setup nodemailer using Gmail credentials from .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDEREMAIL,
    pass: process.env.SENDERPASS,
  },
});
 
// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
 
// 🔹 Controller: Send OTP
export const sendOtpController = async (req, res) => {
  try {
    const { userProfileId } = req.body;
    if (!userProfileId)
      return res.status(400).json({ status: "failed", message: "userProfileId required" });
 
    const user = await prisma.userProfile.findUnique({ where: { id: userProfileId } });
    if (!user) return res.status(404).json({ status: "failed", message: "Candidate not found" });
 
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
 
    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { verificationOtp: otp, otpExpiry: expiry },
    });
 
    // Send OTP via email
    const mailOptions = {
      from: process.env.SENDEREMAIL,
      to: user.email,
      subject: "Candidate Verification OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };
 
    await transporter.sendMail(mailOptions);
 
    return res.json({ status: "success", message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "failed", message: "Failed to send OTP" });
  }
};
 
// 🔹 Controller: Verify OTP
export const verifyOtpController = async (req, res) => {
  try {
    const { userProfileId, otp } = req.body;
 
    const user = await prisma.userProfile.findUnique({ where: { id: userProfileId } });
    if (!user) return res.status(404).json({ status: "failed", message: "Candidate not found" });
 
    if (user.verificationOtp !== otp)
      return res.status(400).json({ status: "failed", message: "Invalid OTP" });
 
    const now = new Date();
    if (now > user.otpExpiry)
      return res.status(400).json({ status: "failed", message: "OTP expired" });
 
    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { isVerified: true, verificationOtp: null, otpExpiry: null },
    });
 
    return res.json({ status: "success", message: "Verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "failed", message: "Verification failed" });
  }
};