import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import prisma from "../config/prisma.js";
import generateToken, { generateRefreshToken } from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

const otpStore = new Map();

const external_backend_url = process.env.EXTERNAL_BACKEND_URL;

console.log("external_url", external_backend_url);

/**
 * Generate OTP and create user (no external registration here anymore)
 */
const userOtpGenerate = async (req, res) => {
  try {
    const { email, role, name } = req.body;
    let user = await prisma.users.findFirst({ where: { email } });

    // If user not found, create it
    if (!user) {
      //const name = email.split("@")[0];
      user = await prisma.users.create({
        data: { name, email, role },
      });
    }

    // Generate and store OTP
    const GenerateOtp = generateOtp();
    otpStore.set(email, GenerateOtp);
    console.log("🗂️ otpStore:", otpStore);

    // ✅ Send OTP email
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: getOtpEmailTemplate({
        otp: GenerateOtp,
        name,
      }),
    });
    return res.status(200).json({
      status: "success",
      message: "OTP sent to email",
    });
  } catch (err) {
    logger.error(
      "Error in userOtpGenerate:",
      JSON.stringify(err.message, null, 2),
    );
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
    });
  }
};

const getOtpEmailTemplate = ({ otp, name }) => `
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
              <h2 style="margin:0;">QuickHireSF</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px; color:#333;">
              <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>

              <p style="font-size:14px;">
                Welcome to <strong>QuickHireSF</strong>.  
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
                This OTP is valid for a short time.  
                Please do not share it with anyone.
              </p>

              <p>— <strong>QuickHireSF Team</strong></p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb; padding:12px; text-align:center; font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} QuickHireSF
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Validate OTP
 * If invalid → delete user from Prisma (no external deregistration)
 * If valid → login locally (no external login here)
 */
const userOtpValidator = async (req, res) => {
  try {
    const { email, otp } = req.body;
    logger.info("🔍 Validating OTP for:", email);

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const savedOtp = otpStore.get(email);
    if (!savedOtp) {
      return res.status(400).json({
        status: "error",
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    // ❌ OTP INVALID
    if (otp !== savedOtp) {
      logger.warn("❌ Invalid OTP for:", email);

      // await prisma.users.delete({ where: { email } });
      otpStore.delete(email);

      return res.status(401).json({
        status: "error",
        message: "Invalid OTP. User has been deleted.",
      });
    }

    logger.success(
      `✅ OTP is correct (Generated: ${savedOtp}, Received: ${otp})`,
    );
    otpStore.delete(email);

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    logger.error(
      "❌ OTP validation error:",
      JSON.stringify(err.message, null, 2),
    );
    return res.status(500).json({
      status: "error",
      message: "An error occurred during validation:" + err.message,
    });
  }
};

// const setPassword = async (req, res) => {
//   const { email, password, role, token } = req.body;

//   if (!email || !password || !role) {
//     return res.status(400).json({
//       status: "error",
//       message: "Email, password, and role are required",
//     });
//   }

//   try {
//     let invite = null;

//     /* ─────────────────────────────
//        1️⃣ VALIDATE INVITE (IF EXISTS)
//     ───────────────────────────── */
//     if (token) {
//       invite = await prisma.organizationInvite.findUnique({
//         where: { token },
//       });

//       if (!invite)
//         return res.status(400).json({
//           status: "error",
//           message: "Invalid or already used invite",
//         });

//       if (invite.expiresAt < new Date())
//         return res.status(400).json({
//           status: "error",
//           message: "Invite has expired",
//         });

//       if (invite.email !== email)
//         return res.status(400).json({
//           status: "error",
//           message: "Invite data mismatch",
//         });
//     }

//     /* ─────────────────────────────
//        2️⃣ FIND USER
//     ───────────────────────────── */
//     const user = await prisma.users.findUnique({ where: { email } });

//     if (!user)
//       return res.status(404).json({
//         status: "error",
//         message: "User not found. Please complete OTP verification first.",
//       });

//     if (user.role !== role)
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid role for this user",
//       });

//     /* ─────────────────────────────
//        3️⃣ HASH PASSWORD
//     ───────────────────────────── */
//     const hashedPassword = await bcrypt.hash(password, 10);

//     /* ─────────────────────────────
//        4️⃣ TRANSACTION (USER + ORG)
//     ───────────────────────────── */
//     const result = await prisma.$transaction(async (tx) => {
//       // Update password
//       const updatedUser = await tx.users.update({
//         where: { email },
//         data: { password: hashedPassword },
//       });

//       // 🔹 INVITE FLOW → Join existing org
//       if (invite) {
//         await tx.organizationMember.create({
//           data: {
//             userId: updatedUser.id,
//             organizationId: invite.organizationId,
//             role: invite.role, // TRUST INVITE ROLE
//             permissions: invite.permissions,
//           },
//         });

//         await tx.organizationInvite.delete({
//           where: { id: invite.id },
//         });
//       }

//       // 🔹 NORMAL FLOW → Create org and lincence if company
//       if (!invite && role === "company") {
//         const existingMembership = await tx.organizationMember.findFirst({
//           where: { userId: updatedUser.id },
//         });

//         if (!existingMembership) {
//           // 1️⃣ Create organization
//           const org = await tx.organization.create({
//             data: {
//               name:
//                 updatedUser.companyName || `${updatedUser.name}'s Organization`,
//             },
//           });

//           // 2️⃣ Create subscription (FREE / BASIC equivalent)
//           const subscription = await tx.organizationSubscription.create({
//             data: {
//               organizationId: org.id,
//               status: "ACTIVE",
//               billingCycle: "MONTHLY",
//               autoRenew: false,
//               currentPeriodStart: new Date(),
//               currentPeriodEnd: new Date(
//                 new Date().setMonth(new Date().getMonth() + 1),
//               ),
//               nextBillingDate: new Date(
//                 new Date().setMonth(new Date().getMonth() + 1),
//               ),
//             },
//           });

//           // 3️⃣ Create org member (ADMIN)
//           const member = await tx.organizationMember.create({
//             data: {
//               userId: updatedUser.id,
//               organizationId: org.id,
//               role: "COMPANY_ADMIN",
//             },
//           });

//           // 4️⃣ Create license and assign to admin
//           await tx.license.create({
//             data: {
//               subscriptionId: subscription.id,
//               planId: "9767d926-261d-4d48-a9b8-c805876ee341",
//               assignedToId: member.id,
//               validUntil: new Date(
//                 new Date().setMonth(new Date().getMonth() + 1),
//               ),
//               isActive: true,
//             },
//           });
//         }
//       }

//       return updatedUser;
//     });

//     /* ─────────────────────────────
//        5️⃣ EXTERNAL CHAT REGISTRATION
//     ───────────────────────────── */
//     let externalUserId;

//     try {
//       const payload = {
//         email,
//         username: email.split("@")[0].toLowerCase(),
//         password,
//       };

//       const registerResponse = await axios.post(
//         `${external_backend_url}/api/v1/users/register`,
//         payload,
//         { headers: { "Content-Type": "application/json" } },
//       );

//       externalUserId = registerResponse?.data?.data?.user?._id;

//       if (!externalUserId) throw new Error("Chat user id missing");
//     } catch (err) {
//       // HARD ROLLBACK USER
//       await prisma.users.delete({ where: { email } });

//       return res.status(500).json({
//         status: "error",
//         message: "External chat registration failed",
//       });
//     }

//     /* ─────────────────────────────
//        6️⃣ SYNC CHAT USER ID
//     ───────────────────────────── */
//     await prisma.users.update({
//       where: { id: result.id },
//       data: { chatuserid: externalUserId },
//     });

//     /* ─────────────────────────────
//        7️⃣ SUCCESS
//     ───────────────────────────── */
//     return res.status(200).json({
//       status: "success",
//       message: invite
//         ? "Password set & organization joined successfully"
//         : "Password set & organization created successfully",
//     });
//   } catch (error) {
//     console.error("Error in setPassword:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

const setPassword = async (req, res) => {
  const { email, password, role, token } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      status: "error",
      message: "Email, password, and role are required",
    });
  }

  let invite = null;
  let externalUserId = null;

  try {
    /* ─────────────────────────────
       1️⃣ VALIDATE INVITE (IF EXISTS)
    ───────────────────────────── */
    if (token) {
      invite = await prisma.organizationInvite.findUnique({
        where: { token },
      });

      if (!invite)
        return res.status(400).json({
          status: "error",
          message: "Invalid or already used invite",
        });

      if (invite.expiresAt < new Date())
        return res.status(400).json({
          status: "error",
          message: "Invite has expired",
        });

      if (invite.email !== email)
        return res.status(400).json({
          status: "error",
          message: "Invite data mismatch",
        });
    }

    /* ─────────────────────────────
       2️⃣ FIND USER
    ───────────────────────────── */
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user)
      return res.status(404).json({
        status: "error",
        message: "User not found. Please complete OTP verification first.",
      });

    if (user.role !== role)
      return res.status(400).json({
        status: "error",
        message: "Invalid role for this user",
      });

    /* ─────────────────────────────
       3️⃣ HASH PASSWORD
    ───────────────────────────── */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ─────────────────────────────
       4️⃣ REGISTER EXTERNAL CHAT USER FIRST
    ───────────────────────────── */
    try {
      const payload = {
        email,
        username: email.split("@")[0].toLowerCase(),
        password,
      };

      const registerResponse = await axios.post(
        `${external_backend_url}/api/v1/users/register`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      externalUserId = registerResponse?.data?.data?.user?._id;

      if (!externalUserId) throw new Error("Chat user id missing");
    } catch (err) {
      console.error("External chat registration failed:", err.message);

      return res.status(500).json({
        status: "error",
        message: "External chat registration failed",
      });
    }

    /* ─────────────────────────────
       5️⃣ MAIN DATABASE TRANSACTION
    ───────────────────────────── */
    const result = await prisma.$transaction(async (tx) => {
      // Update user password + chat id
      const updatedUser = await tx.users.update({
        where: { email },
        data: {
          password: hashedPassword,
          chatuserid: externalUserId,
        },
      });

      /* 🔹 INVITE FLOW */
      if (invite) {
        const subscription = await tx.organizationSubscription.findFirst({
          where: {
            organizationId: invite.organizationId,
            status: "ACTIVE",
          },
        });

        if (!subscription) {
          throw new Error("No active subscription found for organization");
        }

        const freeLicense = await tx.license.findFirst({
          where: {
            subscriptionId: subscription.id,
            isActive: true,
            assignedToId: null,
            validUntil: { gte: new Date() },
          },
          orderBy: { validUntil: "asc" },
        });

        if (!freeLicense) {
          throw new Error(
            "No available license seat. Please contact your admin.",
          );
        }

        const newMember = await tx.organizationMember.create({
          data: {
            userId: updatedUser.id,
            organizationId: invite.organizationId,
            role: invite.role,
            permissions: invite.permissions,
          },
        });

        await tx.license.update({
          where: { id: freeLicense.id },
          data: { assignedToId: newMember.id },
        });

        await tx.organizationInvite.delete({
          where: { id: invite.id },
        });
      }

      /* 🔹 NORMAL COMPANY FLOW */
      if (!invite && role === "company") {
        const existingMembership = await tx.organizationMember.findFirst({
          where: { userId: updatedUser.id },
        });

        if (!existingMembership) {
          const org = await tx.organization.create({
            data: {
              name:
                updatedUser.companyName || `${updatedUser.name}'s Organization`,
            },
          });

          const subscription = await tx.organizationSubscription.create({
            data: {
              organizationId: org.id,
              status: "ACTIVE",
              billingCycle: "MONTHLY",
              autoRenew: false,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
              nextBillingDate: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
            },
          });

          const member = await tx.organizationMember.create({
            data: {
              userId: updatedUser.id,
              organizationId: org.id,
              role: "COMPANY_ADMIN",
            },
          });

          await tx.license.create({
            data: {
              subscriptionId: subscription.id,
              planId: "9767d926-261d-4d48-a9b8-c805876ee341",
              assignedToId: member.id,
              validUntil: new Date(
                new Date().setMonth(new Date().getMonth() + 1),
              ),
              isActive: true,
            },
          });
        }
      }

      return updatedUser;
    });

    /* ─────────────────────────────
       6️⃣ SUCCESS RESPONSE
    ───────────────────────────── */
    return res.status(200).json({
      status: "success",
      message: invite
        ? "Password set, organization joined & license assigned successfully"
        : "Password set & organization created successfully",
    });
  } catch (error) {
    console.error("Error in setPassword:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Local + External login flow
 */
const login = async (req, res) => {
  logger.info("📨 login route called", { body: req.body });
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      logger.warn("⚠️ Missing login fields");
      return res.status(400).json({
        status: "error",
        message: "Please provide email, password, and role",
      });
    }

    // Check user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn("⚠️ User not found:", email);
      return res.status(404).json({
        status: "error",
        message: "User not found. Please Register First",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid Email or Password",
      });
    }

    // Validate role
    if (user.role !== role) {
      return res.status(403).json({
        status: "error",
        message: `User is not authorized as ${role}`,
      });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId: user.id },
    });

    // console.log("member", member);

    if (role === "company" && !member) {
      return res.status(500).json({
        status: "error",
        message: "Organization missing for this user. Contact support.",
      });
    }

    if (role === "company") {
      const Default = await prisma.taskTemplate.findFirst({
        where: { recruiterId: user.id, organizationId: member?.organizationId },
        select: { isDefault: true },
      });

      if (!Default) {
        const defaultTasks = [
          "Review Resume",
          "HR Screening",
          "Technical Interview",
          "Salary Discussion",
          "Offer Rollout",
        ];

        await prisma.taskTemplate.createMany({
          data: defaultTasks.map((title, index) => ({
            recruiterId: user.id,
            organizationId: member?.organizationId,
            title,
            order: index + 1,
            isDefault: true,
          })),
        });
      }
    }

    // Generate local JWT
    const userjwt = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: member?.organizationId || null,
      permission: member?.permissions || null,
    };
    const token = generateToken(userjwt);
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Attempt external login
    let loginResponse = null;
    try {
      const payload = {
        email: user.email,
        username: user.email.split("@")[0].toLocaleLowerCase(),
        password,
      };

      loginResponse = await axios.post(
        `${external_backend_url}/api/v1/users/login`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      console.log("✅ External Login Response:", loginResponse?.data);
    } catch (err) {
      console.error(
        "⚠️ External login failed (continuing local flow):",
        err.message,
        null,
        2,
      );
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Final response
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: member?.organizationId || null,
        companyName: user.companyName || null,
        profileUrl: user.profileUrl || null,
        phoneNumber: user.phoneNumber || null,
      },
      chatmeatadata: loginResponse?.data?.data
        ? {
            user: loginResponse.data.data.user,
            accessToken: loginResponse.data.data.accessToken,
            refreshToken: loginResponse.data.data.refreshToken,
          }
        : null,
    });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error" + error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  logger.info(
    "📨 forgotPassword called",
    JSON.stringify({ body: req.body }, null, 2),
  );
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and role are required" });
    }

    // ✅ Correct Prisma query
    const user = await prisma.users.findFirst({
      where: { email, role },
    });

    if (!user) {
      logger.warn("⚠️ Forgot password user not found:", email);
      return res
        .status(404)
        .json({ status: "error", message: "User not found. Please Register" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min validity

    // Save OTP to DB
    await prisma.users.update({
      where: { id: user.id },
      data: { otp: otp.toString(), otpExpiry },
    });

    // Send email (mock or actual)
    logger.info(`OTP for ${email}: ${otp}`);

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    logger.error(
      "Forgot password error:",
      JSON.stringify(error.message, null, 2),
    );
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  logger.info("📨 resetPassword called", { body: req.body });

  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // const external_backend_url = process.env.EXTERNAL_BACKEND_URL;
    try {
      const payload = {
        email,
        newPassword: password,
      };

      const resp = await axios.post(
        `${external_backend_url}/api/v1/users/reset-password`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        },
      );
      console.log("🌍 External password reset success", resp);
    } catch (err) {
      console.error(
        "❌ External reset failed:",
        err.response?.data || err.message,
      );

      return res.status(502).json({
        status: "error",
        message: "Password reset failed. Please try again.",
      });
    }

    // 🔐 STEP 2: Only runs if external succeeded
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log("✅ Local password updated after external success");

    return res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    logger.error(
      "Reset password error:",
      JSON.stringify(error.message, null, 2),
    );

    return res.status(500).json({
      status: "error",
      message: "Internal server error" + error.message,
    });
  }
};

// const checkUserExists = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Email is required",
//       });
//     }

//     const user = await prisma.users.findFirst({ where: { email } });

//     if (user) {
//       return res.status(200).json({
//         status: "success",
//         message: "User already registered. Please login.",
//       });
//     }

//     return res.status(200).json({
//       status: "error",
//       message: "User not registered. You can generate OTP.",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: "error",
//       message: err.message || "Something went wrong",
//     });
//   }
// };

const checkUserExists = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "failed",
        message: "Email is required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if exact user exists
    const user = await prisma.users.findFirst({
      where: { email: normalizedEmail },
    });

    if (user) {
      return res.status(200).json({
        status: "success",
        message: "User already registered. Please login.",
        existingEmail: user.email,
        data: {
          email: user.email,
          role: user.role,
        },
      });
    }

    // If role is company, check if domain already exists
    if (role === "company") {
      const emailParts = normalizedEmail.split("@");

      if (emailParts.length !== 2) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid email format",
        });
      }

      const domain = emailParts[1];

      // Check if any company user with same domain exists
      const domainUser = await prisma.users.findFirst({
        where: {
          role: "company",
          email: {
            endsWith: `@${domain}`,
            mode: "insensitive",
          },
        },
      });

      if (domainUser) {
        return res.status(200).json({
          status: "success",
          message: `A company with this domain (@${domain}) is already registered.`,
          existingEmail: domainUser.email,
          data: {
            email: domainUser.email,
            domain: domain,
            role: domainUser.role,
          },
        });
      }
    }

    return res.status(200).json({
      status: "error",
      message: "User not registered. You can generate OTP.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  console.log("refreshAccessToken called");

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(refreshToken, process.env.R_SECRETKEY);

    // ✅ Validate SESSION instead of user.refreshToken
    const session = await prisma.userSession.findFirst({
      where: {
        userId: decoded.id,
        refreshToken,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            organizationMember: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const user = session.user;

    const accessPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationMember?.organizationId || null,
      permission: user.organizationMember?.permissions || null,
    };

    const newAccessToken = generateToken(accessPayload);

    return res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    console.log("refresh error", error.message);
    return res.status(403).json({
      message: "Refresh token expired or invalid",
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // ✅ Revoke only THIS session
      await prisma.userSession.updateMany({
        where: { refreshToken },
        data: { revoked: true },
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Logout failed",
    });
  }
};

const getActiveDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      status: "success",
      devices: sessions.map((s) => ({
        sessionId: s.id,
        device: s.userAgent || "Unknown device",
        ipAddress: s.ipAddress,
        loggedInAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (error) {
    console.error("❌ Failed to fetch active devices:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch active devices",
    });
  }
};

const logoutSingleDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: "error",
        message: "Session ID is required",
      });
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        revoked: false,
      },
    });

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found or already logged out",
      });
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { revoked: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Device logged out successfully",
    });
  } catch (error) {
    console.error("❌ Failed to logout device:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to logout device",
    });
  }
};

const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.userSession.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: "success",
      message: "Logged out from all devices",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Logout from all devices failed",
    });
  }
};

export {
  userOtpGenerate,
  userOtpValidator,
  setPassword,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  checkUserExists,
  logout,
  getActiveDevices,
  logoutSingleDevice,
  logoutAll,
};
