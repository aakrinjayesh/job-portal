import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";

const otpStore = new Map();

/**
 * Generate OTP and create user (no external registration here anymore)
 */
const userOtpGenerate = async (req, res) => {
  try {
    const { email, role } = req.body;
    let user = await prisma.users.findUnique({ where: { email } });

    // If user not found, create it
    if (!user) {
      const name = email.split("@")[0];
      user = await prisma.users.create({
        data: { name, email, role },
      });
    }

    // Generate and store OTP
    const GenerateOtp = generateOtp();
    otpStore.set(email, GenerateOtp);
    console.log("🗂️ otpStore:", otpStore);

    // Send OTP to email
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      text: `Your verification code is ${GenerateOtp}`,
    });

    return res.status(200).json({
      status: "success",
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("Error in userOtpGenerate:", err);
    return res
      .status(400)
      .json({ status: "failed", message: err.message || "Something went wrong" });
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
    console.log("🔍 Validating OTP for:", email);

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const savedOtp = otpStore.get(email);
    if (!savedOtp) {
      return res.status(400).json({
        status: "failed",
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    // ❌ OTP INVALID
    if (otp !== savedOtp) {
      console.log("❌ Invalid OTP for:", email);

      await prisma.users.delete({ where: { email } });
      otpStore.delete(email);

      return res.status(401).json({
        status: "failed",
        message: "Invalid OTP. User has been deleted.",
      });
    }

    console.log(`✅ OTP is correct (Generated: ${savedOtp}, Received: ${otp})`);
    otpStore.delete(email);

   

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("❌ OTP validation error:", err);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred during validation",
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
        status: "failed",
        message: "Email, password, and role are required",
      });
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found. Please complete OTP verification first.",
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid role for this user",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update locally
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Register user in external system
    try {
      const payload = {
        email: updatedUser.email,
        username: updatedUser.name,
        password, // use actual password now
      };

      const registerResponse = await axios.post(
        "http://localhost:8080/api/v1/users/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ External Register Response:", registerResponse?.data);
    } catch (err) {
      console.error("⚠️ External registration failed (continuing flow):", err.message);
    }

    return res.status(200).json({
      status: "success",
      message: "Password set successfully!",
    });
  } catch (error) {
    console.error("Error in setPassword:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

/**
 * Local + External login flow
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide email, password, and role",
      });
    }

    // Check user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid password",
      });
    }

    // Validate role
    if (user.role !== role) {
      return res.status(403).json({
        status: "failed",
        message: `User is not authorized as ${role}`,
      });
    }

    // Generate local JWT
    const userjwt = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = generateToken(userjwt);

    // Attempt external login
    let loginResponse = null;
    try {
      const payload = {
        email: user.email,
        username: user.name,
        password,
      };

      loginResponse = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ External Login Response:", loginResponse?.data);
    } catch (err) {
      console.error("⚠️ External login failed (continuing local flow):", err.message);
    }

    // Cookie setup (same as before)
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    if (loginResponse?.data?.accessToken && loginResponse?.data?.refreshToken) {
      res
        .cookie("accessToken", loginResponse?.data?.accessToken, options)
        .cookie("refreshToken", loginResponse?.data?.refreshToken, options);
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
      chatmeatadata: loginResponse
        ? {
            user: loginResponse?.data?.user,
            astoken: loginResponse?.data?.accessToken,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export { userOtpGenerate, userOtpValidator, setPassword, login };
