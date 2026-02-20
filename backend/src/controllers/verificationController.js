import prisma from "../config/prisma.js";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import { logger } from "../utils/logger.js";

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
      html: otpEmailTemplate(user.fullName, otp), // 👈 HTML email
    };

    await sendEmail(mailOptions);
    logger.info(`OTP email sent to ${user.email}`);

    return res.json({ status: "success", message: "OTP sent successfully" });
  } catch (err) {
    logger.error(
      "Error in sendOtpController:",
      JSON.stringify(err.message, null, 2),
    );
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
    return res
      .status(500)
      .json({ status: "failed", message: "Verification failed" });
  }
};

const otpEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your OTP Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="420" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <tr>
            <td style="background:#2196F3; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">FORCEHEAD</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px; color:#333;">
              <p style="font-size:16px;">
                Hi <strong>${name || "there"}</strong>,
              </p>

              <p style="font-size:14px;">
                Welcome to <strong>FORCEHEAD</strong>.  
                Use the verification code below:
              </p>

              <div style="text-align:center; margin:30px 0;">
                <span style="
                  font-size:26px;
                  letter-spacing:6px;
                  font-weight:bold;
                  background:#f1f5f9;
                  padding:14px 24px;
                  border-radius:6px;
                  display:inline-block;">
                  ${otp}
                </span>
              </div>

              <p style="font-size:13px; color:#6b7280;">
                Please do not share this OTP with anyone.
              </p>

              <p>— <strong>FORCEHEAD Team</strong></p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb; padding:12px; text-align:center; font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} FORCEHEAD
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
