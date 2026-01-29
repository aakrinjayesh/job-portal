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

    // 2️⃣ Validate email type (personal/business)
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
      username: email.split("@")[0].toLocaleLowerCase(),
      password: "Aakrin@123", // chat system only
    };

    let isNewUser = false;
    let externalUserId = null;

    // 4️⃣ New user → create locally & register externally
    if (!user) {
      isNewUser = true;

      user = await prisma.users.create({
        data: {
          name: fullName,
          email,
          role: "candidate",
        },
      });

      try {
        const externalRegisterResp = await axios.post(
          `${external_backend_url}/api/v1/users/register`,
          externalPayload,
          { headers: { "Content-Type": "application/json" } },
        );
        console.log("external api", externalRegisterResp.data);
        externalUserId = externalRegisterResp?.data?.data?.user?._id;

        console.log("externaluser id googkle", externalUserId);

        if (!externalUserId) {
          throw new Error("External register succeeded but _id missing");
        }

        // logger.info(
        //   "✅ External register (Google)",
        //   JSON.stringify(externalRegisterResp.data, null, 2)
        // );
        console.log("exteranl register google", externalRegisterResp);
      } catch (err) {
        const deleteUser = await prisma.users.delete({
          where: {
            email: email,
          },
        });
        console.log("delete User", deleteUser);
        logger.error(
          "❌ External register failed (Google)",
          JSON.stringify(err.message, null, 2),
        );
        return res.status(500).json({
          status: "error",
          message: "External chat registration failed",
        });
      }
    }

    // 5️⃣ Always external login (source of truth)
    let externalLoginData = null;
    try {
      const loginResp = await axios.post(
        `${external_backend_url}/api/v1/users/login`,
        externalPayload,
        { headers: { "Content-Type": "application/json" } },
      );

      externalLoginData = loginResp.data?.data;

      if (externalLoginData?.user?._id) {
        externalUserId = externalLoginData.user._id;
      }

      logger.info(
        "✅ External login (Google)",
        JSON.stringify(loginResp.data, null, 2),
      );
    } catch (err) {
      logger.error(
        "❌ External login failed (Google)",
        JSON.stringify(err.message, null, 2),
      );
      return res.status(500).json({
        status: "error",
        message: "External chat login failed",
      });
    }

    if (!externalUserId) {
      return res.status(500).json({
        status: "error",
        message: "Failed to resolve chat user id",
      });
    }

    // 6️⃣ UPSERT UserProfile (candidate only)
    try {
      await prisma.users.update({
        where: { id: user.id },
        data: { chatuserid: externalUserId },
      });

      logger.info(
        "✅ chatuserid synced (Google)",
        JSON.stringify(
          { userId: user.id, chatuserid: externalUserId },
          null,
          2,
        ),
      );
    } catch (err) {
      logger.error(
        "❌ Failed to upsert UserProfile.chatuserid",
        JSON.stringify(err.message, null, 2),
      );
      return res.status(500).json({
        status: "error",
        message: "Failed to sync chat profile",
      });
    }

    // 7️⃣ Local JWT
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

      chatmeatadata: {
        user: externalLoginData.user,
        accessToken: externalLoginData.accessToken,
        refreshToken: externalLoginData.refreshToken,
      },
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
