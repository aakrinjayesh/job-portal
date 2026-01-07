import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger.js";

const otpStore = new Map();

/**
 * Generate OTP and create user (no external registration here anymore)
 */
const userOtpGenerate = async (req, res) => {
  try {
    const { email, role,name } = req.body;
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
    logger.info("🗂️ otpStore:", otpStore);
    console.log("otpStore",otpStore)
    // Send OTP to email
   const sendmail = await sendEmail({
      to: email,
      subject: "Your OTP Code",
      text: `Hi, Welcome to QuickHireSF
      Your verification code is ${GenerateOtp}`,
    });
    return res.status(200).json({
      status: "success",
      message: "OTP sent to email",
    });
  } catch (err) {
    logger.error("Error in userOtpGenerate:", JSON.stringify(err.message,null,2));
    return res
      .status(500)
      .json({ status: "error", message: err.message || "Something went wrong" });
  }
};

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

      await prisma.users.delete({ where: { email } });
      otpStore.delete(email);

      return res.status(401).json({
        status: "error",
        message: "Invalid OTP. User has been deleted.",
      });
    }

    logger.success(`✅ OTP is correct (Generated: ${savedOtp}, Received: ${otp})`);
    otpStore.delete(email);

   

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    logger.error("❌ OTP validation error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "An error occurred during validation:" + err.message,
    });
  }
};

/**
 * Set password and register on external service
 */
const setPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "Email, password, and role are required",
      });
    }

    // 1️⃣ Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Please complete OTP verification first.",
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role for this user",
      });
    }

    // 2️⃣ Hash & set password locally
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 3️⃣ Register user in external chat system
    let externalUserId = null;

    try {
      const payload = {
        email: updatedUser.email,
        username: updatedUser.email.split('@')[0].toLocaleLowerCase(),
        password, // real password
      };

      const registerResponse = await axios.post(
        "http://localhost:8080/api/v1/users/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      externalUserId = registerResponse?.data?.data?.user?._id;
      console.log('extarnal userId', externalUserId)
      if (!externalUserId) {
        logger.error("❌ External register succeeded but _id missing");
        throw new Error("External user id missing");
      }

      logger.info(
        "✅ External Register Success",
        JSON.stringify(registerResponse.data, null, 2)
      );
    } catch (err) {
      logger.error(
        "❌ External registration failed",
        JSON.stringify(err.message, null, 2)
      );
      const deleteUser = await prisma.users.delete({
          where:{
            email:email
          }
        })
      console.log('deleted user',deleteUser)
      return res.status(500).json({
        status: "error",
        message: "External chat registration failed",
      });
    }

    // 4️⃣ UPSERT UserProfile with chatuserid (FAIL HARD)
    try {
      await prisma.users.update({
        where: { id: user.id },
        data: { chatuserid: externalUserId },
      });

      logger.info(
        `✅ chatuserid synced for ${role}`,
        JSON.stringify(
          { userId: user.id, chatuserid: externalUserId },
          null,
          2
        )
      );
    } catch (err) {
      logger.error(
        "❌ Failed to upsert UserProfile.chatuserid",
        JSON.stringify(err.message, null, 2)
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to sync chat user profile",
      });
    }

    // 5️⃣ Final success
    return res.status(200).json({
      status: "success",
      message: "Password set successfully",
    });
  } catch (error) {
    logger.error(
      "Error in setPassword:",
      JSON.stringify(error.message, null, 2)
    );
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
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

    // Generate local JWT
    const userjwt = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan
    };
    const token = generateToken(userjwt);

    // Attempt external login
    let loginResponse = null;
    try {
      const payload = {
        email: user.email,
        username: user.email.split('@')[0].toLocaleLowerCase(),
        password,
      };

      loginResponse = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ External Login Response:", loginResponse?.data);
    } catch (err) {
      console.error("⚠️ External login failed (continuing local flow):",err.message,null,2);
    }


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
    logger.error("Login error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Internal server error" + error.message,
    });
  }
};




const forgotPassword = async (req, res) => {
  logger.info("📨 forgotPassword called", JSON.stringify({ body: req.body },null,2));
  try {
    const { email, role } = req.body;
 
    if (!email || !role) {
      return res.status(400).json({ status: "error", message: "Email and role are required" });
    }
 
    // ✅ Correct Prisma query
    const user = await prisma.users.findFirst({
      where: { email, role },
    });
 
    if (!user) {
      logger.warn("⚠️ Forgot password user not found:", email);
      return res.status(404).json({ status: "error", message: "User not found. Please Register" });
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
    logger.error("Forgot password error:", JSON.stringify(error.message,null,2));
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
 
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
 
    return res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    logger.error("Reset password error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const checkUserExists = async (req, res) => {
  try {
    const { email } = req.body;
 
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
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong",
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
  checkUserExists
};