import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import prisma from "../config/prisma.js";
import {
  getOtpEmailTemplate,
  getWelcomePasswordEmailTemplate,
} from "../utils/emailTemplates/LoginTemplates.js";
import generateToken, { generateRefreshToken } from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/handleError.js";

const otpStore = new Map();

const external_backend_url = process.env.EXTERNAL_BACKEND_URL;

console.log("external_url", external_backend_url);

/**
 * Generate OTP and create user (no external registration here anymore)
 */
const userOtpGenerate = async (req, res) => {
  try {
    const { email: em, role, name } = req.body;
    const email = em.toLowerCase().trim();
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
      text: "Your OTP For Registration",
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
    console.log("error:", err);
    // console.error(
    //   "Error in userOtpGenerate:",
    //   JSON.stringify(err.message, null, 2),
    // );
    handleError(err, req, res);
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * Validate OTP
 * If invalid → delete user from Prisma (no external deregistration)
 * If valid → login locally (no external login here)
 */
const userOtpValidator = async (req, res) => {
  try {
    const { email: em, otp } = req.body;
    const email = em.toLowerCase().trim();

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
        message: "Invalid OTP. Please Request New OTP",
      });
    }

    console.log(`✅ OTP is correct (Generated: ${savedOtp}, Received: ${otp})`);
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
    handleError(err, req, res);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during validation:" + err.message,
    });
  }
};

const setPassword = async (req, res) => {
  const { email: em, password, role, token } = req.body;

  const email = em.toLowerCase().trim();

  if (!email || !password || !role) {
    return res.status(400).json({
      status: "error",
      message: "Email, password, and role are required",
    });
  }

  let invite = null;
  let externalUserId = null;

  try {
    /* 1️⃣ VALIDATE INVITE */
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

      if (invite.email.toLowerCase() !== email)
        return res.status(400).json({
          status: "error",
          message: "Invite data mismatch",
        });
    }

    /* 2️⃣ FIND USER */
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

    /* 3️⃣ HASH PASSWORD */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 4️⃣ OPTIONAL EXTERNAL CHAT */
    try {
      if (external_backend_url) {
        const payload = {
          email,
          username: email.split("@")[0].toLowerCase(),
          password,
        };

        const registerResponse = await axios.post(
          `${external_backend_url}/api/v1/users/register`,
          payload,
          { headers: { "Content-Type": "application/json" }, timeout: 3000 },
        );

        externalUserId = registerResponse?.data?.data?.user?._id || null;

        if (externalUserId) {
          console.log("✅ External chat registration successful");
        }
      }
    } catch (err) {
      console.warn(
        "⚠️ External chat registration failed — continuing without chat:",
        err.message,
      );
      // Silent fail — DO NOT RETURN ERROR
    }

    /* 5️⃣ MAIN TRANSACTION */
    const result = await prisma.$transaction(
      async (tx) => {
        const updatedUser = await tx.users.update({
          where: { email },
          data: {
            password: hashedPassword,
            emailverified: true,
            ...(externalUserId && { chatuserid: externalUserId }),
          },
        });

        /* 🔹 INVITE FLOW */
        if (invite) {
          if (!invite.seatId || !invite.licenseId) {
            throw new Error("Invite missing seat or license");
          }

          const seat = await tx.licenseSeat.findUnique({
            where: { id: invite.seatId },
          });

          const license = await tx.license.findUnique({
            where: { id: invite.licenseId },
          });

          if (
            !seat ||
            seat.assignedToId !== null ||
            !license ||
            license.seatId !== seat.id || // 🔥 ensure correct mapping
            !license.isActive ||
            license.validUntil < new Date() ||
            license.assignedToId !== null
          ) {
            throw new Error("The selected seat/license is no longer available");
          }

          const newMember = await tx.organizationMember.create({
            data: {
              userId: updatedUser.id,
              organizationId: invite.organizationId,
              role: invite.role,
              permissions: invite.permissions,
            },
          });

          // Assign seat
          await tx.licenseSeat.update({
            where: { id: seat.id },
            data: { assignedToId: newMember.id },
          });

          // 🔥 Assign EXACT license (FIX)
          await tx.license.update({
            where: { id: license.id },
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
            // Extract domain for auto-join logic
            const domain = email.split("@")[1].toLowerCase();

            const domainMember = await tx.organizationMember.findFirst({
              where: {
                user: {
                  role: "company",
                  email: { endsWith: `@${domain}`, mode: "insensitive" },
                },
              },
              include: { user: true },
            });

            if (domainMember) {
              /* JOIN EXISTING ORG */
              const newMember = await tx.organizationMember.create({
                data: {
                  userId: updatedUser.id,
                  organizationId: domainMember.organizationId,
                },
              });

              await tx.users.update({
                where: { id: updatedUser.id },
                data: {
                  companyName: domainMember.user?.companyName || null,
                },
              });
              const orgSubscription =
                await tx.organizationSubscription.findFirst({
                  where: { organizationId: domainMember.organizationId },
                });

              if (orgSubscription) {
                const basicPlan = await tx.subscriptionPlan.findFirst({
                  where: { tier: "BASIC" },
                });

                if (basicPlan) {
                  const seat = await tx.licenseSeat.create({
                    data: {
                      subscriptionId: orgSubscription.id,
                      assignedToId: newMember.id,
                    },
                  });

                  await tx.license.create({
                    data: {
                      subscriptionId: orgSubscription.id,
                      planId: basicPlan.id,
                      seatId: seat.id,
                      assignedToId: newMember.id,
                      validUntil: new Date(
                        new Date().setMonth(new Date().getMonth() + 1),
                      ),
                      isActive: true,
                    },
                  });
                }
              }
            } else {
              /* CREATE NEW ORG */
              const org = await tx.organization.create({
                data: {
                  name: `${email.split("@")[1].split(".")[0]}'s Organization`,
                },
              });

              const subscription = await tx.organizationSubscription.create({
                data: {
                  organizationId: org.id,
                  status: "ACTIVE",
                  billingCycle: "MONTHLY",
                  autoRenew: true,
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
                },
              });

              const basicPlan = await tx.subscriptionPlan.findFirst({
                where: { tier: "BASIC" },
              });

              if (!basicPlan) {
                return res.status(500).json({
                  status: "error",
                  message: "Basic Plan is not Defined In DB",
                });
              }

              const seat = await tx.licenseSeat.create({
                data: {
                  subscriptionId: subscription.id,
                  assignedToId: member.id,
                },
              });

              await tx.license.create({
                data: {
                  subscriptionId: subscription.id,
                  planId: basicPlan.id,
                  seatId: seat.id,
                  assignedToId: member.id,
                  validUntil: new Date(
                    new Date().setMonth(new Date().getMonth() + 1),
                  ),
                  isActive: true,
                },
              });
            }
          }
        }

        return updatedUser;
      },
      { timeout: 15000 },
    );

    /* ✅ SEND EMAIL HERE */
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to ForceHead",
        html: getWelcomePasswordEmailTemplate({
          name: result.name,
          role: result.role,
        }),
      });
    } catch (err) {
      console.warn("Email failed:", err.message);
    }

    /* ─────────────────────────────
       6️⃣ SUCCESS RESPONSE
    ───────────────────────────── */
    return res.status(200).json({
      status: "success",
      message: invite
        ? "Password set, organization joined & license assigned successfully"
        : "Password set & organization created successfully",
      chatIntegrated: !!externalUserId, // tells frontend if chat is active
    });
  } catch (error) {
    console.error("Error in setPassword:", error.message);
    console.log("error stack", error.stack);
    handleError(error, req, res);
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
    const { email: em, password, role } = req.body;

    const email = em.toLowerCase().trim();

    // 1️⃣ Validate input
    if (!email || !password || !role) {
      logger.warn("⚠️ Missing login fields");
      return res.status(400).json({
        status: "error",
        message: "Please provide email, password, and role",
      });
    }

    // 2️⃣ Check user
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

    // 3️⃣ Validate password
    if (!user.password) {
      return res.status(400).json({
        status: "error",
        message:
          "This account does not support password login. Please use Google Sign-In.",
      });
    }

    // 3️⃣ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid Email or Password",
      });
    }

    // 4️⃣ Validate role
    if (user.role !== role) {
      return res.status(403).json({
        status: "error",
        message: `User is not authorized as ${role}`,
      });
    }

    // 5️⃣ Fetch organization member (if company)
    const member = await prisma.organizationMember.findUnique({
      where: { userId: user.id },
    });

    if (role === "company" && !member) {
      return res.status(500).json({
        status: "error",
        message: "Organization missing for this user. Contact support.",
      });
    }

    // 6️⃣ Create default task templates if not exists
    if (role === "company") {
      const existingDefault = await prisma.taskTemplate.findFirst({
        where: {
          // recruiterId: user.id,
          organizationId: member?.organizationId,
          isDefault: true,
        },
      });

      if (!existingDefault) {
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

    // 7️⃣ Generate JWT
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

    // 8️⃣ Store session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 9️⃣ OPTIONAL External Chat Login (Will NEVER block login)
    let chatMetadata = null;

    try {
      if (external_backend_url) {
        const payload = {
          email: user.email,
          username: user.email.split("@")[0].toLowerCase(),
          password,
        };

        const loginResponse = await axios.post(
          `${external_backend_url}/api/v1/users/login`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 3000, // prevents hanging
          },
        );

        if (loginResponse?.data?.data) {
          chatMetadata = {
            user: loginResponse.data.data.user,
            accessToken: loginResponse.data.data.accessToken,
            refreshToken: loginResponse.data.data.refreshToken,
          };

          logger.info("✅ External chat login successful");
        }
      }
    } catch (err) {
      logger.warn("⚠️ External chat login failed. Skipping chat integration.", {
        message: err.message,
        status: err.response?.status,
      });
      // NO THROW → Silent fail
    }

    // 🔟 Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // ✅ Final response (always succeeds if local auth passed)
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileUrl: user.profileUrl || null,
        ...(user.role !== "candidate" && {
          organizationId: member?.organizationId || null,
          companyName: user.companyName || null,
          phoneNumber: user.phoneNumber || null,
        }),
      },
      chatmeatadata: chatMetadata, // null if external fails
    });
  } catch (error) {
    console.log("error", error.message);
    handleError(error, req, res);
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
    const { email: em, role } = req.body;

    const email = em.toLowerCase().trim();

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
    handleError(error, req, res);
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  logger.info("📨 resetPassword called", { body: req.body });

  try {
    const { email: em, password } = req.body;

    const email = em.toLowerCase().trim();

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

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error" + error.message,
    });
  }
};

const checkUserExists = async (req, res) => {
  try {
    const { email: em } = req.body;

    const email = em.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        status: "failed",
        message: "Email is required",
      });
    }

    const user = await prisma.users.findFirst({ where: { email } });

    if (user) {
      return res.status(200).json({
        status: "success",
        message: "User already registered. Please login.",
      });
    }

    return res.status(200).json({
      status: "error",
      message: "User not registered. You can generate OTP.",
    });
  } catch (err) {
    handleError(err, req, res);
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
    });
  }
};

// const checkUserExists = async (req, res) => {
//   try {
//     const { email, role } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Email is required",
//       });
//     }

//     // Normalize email
//     const normalizedEmail = email.toLowerCase().trim();

//     // Check if exact user exists
//     const user = await prisma.users.findFirst({
//       where: { email: normalizedEmail },
//     });

//     if (user) {
//       return res.status(200).json({
//         status: "success",
//         message: "User already registered. Please login.",
//         existingEmail: user.email,
//         data: {
//           email: user.email,
//           role: user.role,
//         },
//       });
//     }

//     // If role is company, check if domain already exists
//     if (role === "company") {
//       const emailParts = normalizedEmail.split("@");

//       if (emailParts.length !== 2) {
//         return res.status(400).json({
//           status: "failed",
//           message: "Invalid email format",
//         });
//       }

//       const domain = emailParts[1];

//       // Check if any company user with same domain exists
//       const domainUser = await prisma.users.findFirst({
//         where: {
//           role: "company",
//           email: {
//             endsWith: `@${domain}`,
//             mode: "insensitive",
//           },
//         },
//       });

//       if (domainUser) {
//         return res.status(200).json({
//           status: "success",
//           message: `A company with this domain (@${domain}) is already registered.`,
//           existingEmail: domainUser.email,
//           data: {
//             email: domainUser.email,
//             domain: domain,
//             role: domainUser.role,
//           },
//         });
//       }
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
