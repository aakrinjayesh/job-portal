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


// const googleAuth = async (req, res) => {
//   const { credential, clientId, type } = req.body;
 
//   try {
//     // 1️⃣ Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: clientId,
//     });
//     const payload = ticket.getPayload();
//     const { email, given_name, family_name } = payload;

//     if (!email) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Email not found in Google payload",
//       });
//     }

//     // 2️⃣ Validate email type (personal vs company)
//     if (!isValidEmail(email, type)) {
//       const msg = getEmailErrorMessage(type);
//       return res.status(200).json({ status: "failed", message: msg });
//     }

//     // 3️⃣ Check or create user in Prisma
//     let user = await prisma.users.findUnique({ where: { email } });
//     const name =
//       [given_name, family_name].filter(Boolean).join(" ").trim() ||
//       "Google User";

//     const externalPayload = {
//       email,
//       username: name,
//       password: "123456789",
//     };

//     if (!user) {
//       user = await prisma.users.create({
//         data: {
//           name,
//           email,
//           role: type,
//         },
//       });

//       // Try external registration (non-blocking)
//       try {
//         await axios.post(
//           "http://localhost:8080/api/v1/users/register",
//           externalPayload,
//           { headers: { "Content-Type": "application/json" } }
//         );
//       } catch (registerErr) {
//         console.warn(
//           "⚠️ External register failed (continuing):",
//           registerErr.message
//         );
//       }
//     }

//     // 4️⃣ Try to log in externally (optional)
//     let loginResponse = null;
//     try {
//       loginResponse = await axios.post(
//         "http://localhost:8080/api/v1/users/login",
//         externalPayload,
//         { headers: { "Content-Type": "application/json" } }
//       );
//       console.log("External login success:", loginResponse?.data);
//     } catch (loginErr) {
//       console.warn("⚠️ External login failed (continuing):", loginErr.message);
//     }

//     // 5️⃣ Always generate local token
//     const token = generateToken(user);
//     const options = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//     };

 

//     if (loginResponse?.data?.data?.accessToken && loginResponse?.data?.data?.refreshToken) {
//       res
//         .cookie("accessToken", loginResponse?.data?.data?.accessToken, options)
//         .cookie("refreshToken", loginResponse?.data?.data?.refreshToken, options);
//     }

//     // 7️⃣ Return unified response
//     return res.status(200).json({
//       status: "success",
//       message: "Authenticated with Google",
//       token,
//       user: {
//         email: user.email,
//         name: user.name,
//         role: user.role,
//       },
//       chatmeatadata: loginResponse?.data?.data
//         ? {
//             user: loginResponse.data.data.user,
//             accessToken: loginResponse.data.data.accessToken,
//             refreshToken: loginResponse.data.data.refreshToken,
//           }
//         : null,
//     });
//   } catch (err) {
//     console.error("Google auth error:", err.message);
//     return res.status(500).json({
//       status: "failed",
//       message: err.message || "Google authentication failed",
//     });
//   }
// };


const googleAuth = async (req, res) => {
  const { credential, clientId, type } = req.body;

  try {
    // -------------------------------------------
    // 1️⃣ VERIFY GOOGLE TOKEN
    // -------------------------------------------
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

    // -------------------------------------------
    // 2️⃣ VALIDATE EMAIL CATEGORY (Personal/Business)
    // -------------------------------------------
    if (!isValidEmail(email, type)) {
      return res.status(200).json({
        status: "failed",
        message: getEmailErrorMessage(type),
      });
    }

    // -------------------------------------------
    // 3️⃣ LOCAL USER LOOKUP
    // -------------------------------------------
    let user = await prisma.users.findUnique({ where: { email } });

    const fullName = `${given_name || ""} ${family_name || ""}`.trim() || "User";

    const externalPayload = {
      email,
      username: fullName,
      password: "123456789",   // simple pass for chat system only
    };

    let isNewUser = false;

    // -------------------------------------------
    // 4️⃣ IF NEW → CREATE USER LOCALLY & REGISTER IN EXTERNAL SYSTEM
    // -------------------------------------------
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
        console.log('external register', externalregisterData)
      } catch (err) {
        console.warn("⚠️ External register failed:", err.message);
      }
    }

    // -------------------------------------------
    // 5️⃣ ALWAYS TRY EXTERNAL LOGIN
    // -------------------------------------------
    let externalLoginData = null;
    try {
      const loginResp = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        externalPayload
      );

      console.log('extarnal login', loginResp)
      externalLoginData = loginResp.data?.data || null;
    } catch (err) {
      console.warn("⚠️ External login failed:", err.message);
    }

    // -------------------------------------------
    // 6️⃣ ALWAYS GENERATE LOCAL TOKEN
    // -------------------------------------------
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

    // -------------------------------------------
    // 7️⃣ RETURN FINAL RESPONSE
    // -------------------------------------------
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
    console.error("Google auth error:", err);
    return res.status(500).json({
      status: "failed",
      message: err.message || "Google authentication failed",
    });
  }
};


export { googleAuth };
