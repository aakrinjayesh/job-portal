import { OAuth2Client } from "google-auth-library";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";
import { logger } from "../utils/logger.js";

const client = new OAuth2Client();
const external_backend_url = process.env.EXTERNAL_BACKEND_URL;

const freeEmailProviders = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "protonmail.com",
  "icloud.com",
  "aol.com",
  "zoho.com",
  "yandex.com",
];

const isValidEmail = (email, type) => {
  if (!email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  const isFreeEmail = freeEmailProviders.includes(domain);
  return type === "candidate" ? isFreeEmail : !isFreeEmail;
};

const getEmailErrorMessage = (type) => {
  return type === "candidate"
    ? "Please enter a valid personal email"
    : "Please enter a valid Company email";
};

const googleAuth = async (req, res) => {
  const { credential, clientId, type } = req.body;

  try {
    // 🔒 Google auth ONLY for candidates
    if (type !== "candidate") {
      return res.status(403).json({
        status: "error",
        message: "Google authentication is allowed only for candidates",
      });
    }

    // 1️⃣ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email not found in Google",
      });
    }

    // 2️⃣ Validate email type
    if (!isValidEmail(email, type)) {
      return res.status(400).json({
        status: "error",
        message: getEmailErrorMessage(type),
      });
    }

    // 3️⃣ Local user lookup
    let user = await prisma.users.findUnique({ where: { email } });

    const fullName =
      `${given_name || ""} ${family_name || ""}`.trim() || "User";

    const externalPayload = {
      email: email,
      username: email.split("@")[0].toLowerCase(),
      password: "Aakrin@123", // ⚠️ move to env in production
    };

    let isNewUser = false;
    let externalLoginData = null;
    let externalUserId = null;

    // 4️⃣ Create user locally if not exists
    if (!user) {
      isNewUser = true;

      user = await prisma.users.create({
        data: {
          name: fullName,
          email,
          role: "candidate",
        },
      });

      // 🔹 External register (OPTIONAL)
      try {
        const externalRegisterResp = await axios.post(
          `${external_backend_url}/api/v1/users/register`,
          externalPayload,
          { headers: { "Content-Type": "application/json" } },
        );

        externalUserId = externalRegisterResp?.data?.data?.user?._id || null;

        console.log("✅ External register success:", externalUserId);
      } catch (err) {
        console.log("⚠️ External register failed (ignored):", err.message);
      }
    }

    // 5️⃣ External login (OPTIONAL)
    try {
      const loginResp = await axios.post(
        `${external_backend_url}/api/v1/users/login`,
        externalPayload,
        { headers: { "Content-Type": "application/json" } },
      );

      externalLoginData = loginResp.data?.data || null;

      if (externalLoginData?.user?._id) {
        externalUserId = externalLoginData.user._id;
      }

      console.log("✅ External login success");
    } catch (err) {
      console.log("⚠️ External login failed (ignored):", err.message);
    }

    // 6️⃣ Sync chatuserid if available
    if (externalUserId) {
      try {
        await prisma.users.update({
          where: { id: user.id },
          data: { chatuserid: externalUserId },
        });

        console.log("✅ chatuserid synced:", externalUserId);
      } catch (err) {
        console.log("⚠️ chatuserid sync failed:", err.message);
      }
    }

    // 7️⃣ Generate Local JWT
    const localToken = generateToken(user);

    return res.status(200).json({
      status: "success",
      message: isNewUser
        ? "Google Signup Successful"
        : "Google Login Successful",

      token: localToken,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },

      // Chat metadata optional
      chatmetadata: externalLoginData
        ? {
            user: externalLoginData.user,
            accessToken: externalLoginData.accessToken,
            refreshToken: externalLoginData.refreshToken,
          }
        : null,
    });
  } catch (err) {
    logger.error("Google auth error:", JSON.stringify(err.message, null, 2));

    return res.status(500).json({
      status: "error",
      message: err.message || "Google authentication failed",
    });
  }
};

export { googleAuth };
