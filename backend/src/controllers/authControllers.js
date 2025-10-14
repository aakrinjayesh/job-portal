import { OAuth2Client } from "google-auth-library"
import prisma from "../config/prisma.js"
import generateToken from "../utils/generateToken.js"
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

  // console.log(`Email: ${email}, Type: ${type}, Domain: ${domain}, isFree: ${isFreeEmail}`);

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

  if(!email){
    return res.status(400).json({ status: "failed", message: "Email not found in Google payload" })
  }
  
  if (!isValidEmail(email,type)) {
   
    const mesg = getEmailErrorMessage(type)
    return res.status(200).json({ status: 'failed', message: mesg })
  }

  let user = await prisma.users.findUnique({ where: { email } })

  if(!user){
    const name = [given_name, family_name].filter(Boolean).join(' ').trim() || 'Google User'
   
    user = await prisma.users.create({
      data: {
        name,
        email,
        role:type
      }
    })
  }

  const token = generateToken(user)

  return res.status(200).json({
    status: "success",
    message: "Authenticated with Google",
    token,
    role:user?.role
  })
 
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: err.message || "Google authentication failed",
    });
  }
}



export {googleAuth}