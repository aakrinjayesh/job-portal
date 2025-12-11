import { OAuth2Client } from "google-auth-library"
import prisma from "../config/prisma.js"
import generateToken from "../utils/generateToken.js"
import axios from "axios"
import { logger } from "../utils/logger.js"

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

    
    // 2️⃣ VALIDATE EMAIL CATEGORY (Personal/Business)
  
    if (!isValidEmail(email, type)) {
      return res.status(400).json({
        status: "error",
        message: getEmailErrorMessage(type),
      });
    }

    // 3️⃣ LOCAL USER LOOKUP
 
    let user = await prisma.users.findUnique({ where: { email } });

    const fullName = `${given_name || ""} ${family_name || ""}`.trim() || "User";

    const externalPayload = {
      email,
      username: fullName,
      password: "123456789",   // simple pass for chat system only
    };

    let isNewUser = false;


    // 4️⃣ IF NEW → CREATE USER LOCALLY & REGISTER IN EXTERNAL SYSTEM

    if (!user) {
      isNewUser = true;

      user = await prisma.users.create({
        data: {
          name: fullName,
          email,
          role: type,
        },
      });

      // Try external registration (non-blocking)
      try {
       externalregisterData = await axios.post(
          "http://localhost:8080/api/v1/users/register",
          externalPayload
        );
        logger.info('external register', JSON.stringify(externalregisterData,null,2))
      } catch (err) {
        logger.error("⚠️ External register failed:", JSON.stringify(err.message, null, 2));
      }
    }


    // 5️⃣ ALWAYS TRY EXTERNAL LOGIN
    
    let externalLoginData = null;
    try {
      const loginResp = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        externalPayload
      );

      logger.info('extarnal login', JSON.stringify(loginResp, null,2))
      externalLoginData = loginResp.data?.data || null;
    } catch (err) {
      logger.error("⚠️ External login failed:", JSON.stringify(err.message,null,2));
    }


    // 6️⃣ ALWAYS GENERATE LOCAL TOKEN

    const localToken = generateToken(user);

    // Cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Set external tokens if available
    if (externalLoginData?.accessToken) {
      res.cookie("accessToken", externalLoginData.accessToken, cookieOptions);
      res.cookie("refreshToken", externalLoginData.refreshToken, cookieOptions);
    }


    // 7️⃣ RETURN FINAL RESPONSE

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

      chatmeatadata: externalLoginData
        ? {
            user: externalLoginData.user,
            accessToken: externalLoginData.accessToken,
            refreshToken: externalLoginData.refreshToken,
          }
        : null,
    });
  } catch (err) {
    logger.error("Google auth error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({
      status: "error",
      message: err.message || "Google authentication failed",
    });
  }
};


export { googleAuth };
