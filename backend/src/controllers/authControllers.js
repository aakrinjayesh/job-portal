import { OAuth2Client } from "google-auth-library"
import prisma from "../config/prisma.js"
import generateToken from "../utils/generateToken.js"
import axios from "axios"

const client = new OAuth2Client()


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
    // 1️⃣ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({
        status: "failed",
        message: "Email not found in Google payload",
      });
    }

    // 2️⃣ Validate email type (personal vs company)
    if (!isValidEmail(email, type)) {
      const msg = getEmailErrorMessage(type);
      return res.status(200).json({ status: "failed", message: msg });
    }

    // 3️⃣ Check or create user in Prisma
    let user = await prisma.users.findUnique({ where: { email } });
    const name =
      [given_name, family_name].filter(Boolean).join(" ").trim() ||
      "Google User";

    const externalPayload = {
      email,
      username: name,
      password: "123456789",
    };

    if (!user) {
      user = await prisma.users.create({
        data: {
          name,
          email,
          role: type,
        },
      });

      // Try external registration (non-blocking)
      try {
        await axios.post(
          "http://localhost:8080/api/v1/users/register",
          externalPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (registerErr) {
        console.warn(
          "⚠️ External register failed (continuing):",
          registerErr.message
        );
      }
    }

    // 4️⃣ Try to log in externally (optional)
    let loginResponse = null;
    try {
      loginResponse = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        externalPayload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("External login success:", loginResponse?.data);
    } catch (loginErr) {
      console.warn("⚠️ External login failed (continuing):", loginErr.message);
    }

    // 5️⃣ Always generate local token
    const token = generateToken(user);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // 6️⃣ Attach cookies only if external login succeeded
    if (loginResponse?.data?.accessToken && loginResponse?.data?.refreshToken) {
      res.cookie("accessToken", loginResponse.data.accessToken, options);
      res.cookie("refreshToken", loginResponse.data.refreshToken, options);
    }

    // 7️⃣ Return unified response
    return res.status(200).json({
      status: "success",
      message: "Authenticated with Google",
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      chatmetadata: loginResponse
        ? {
            user: loginResponse.data.user,
            astoken: loginResponse.data.accessToken,
          }
        : null, // still respond safely
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    return res.status(500).json({
      status: "failed",
      message: err.message || "Google authentication failed",
    });
  }
};

export { googleAuth };
