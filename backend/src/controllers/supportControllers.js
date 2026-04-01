import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import { handleError } from "../utils/handleError.js";
import { getSupportEmailTemplate } from "../utils/emailTemplates/SupportTemplates.js";

export const createSupportMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      subject,
      message,
    } = req.body;
    console.log("request",req.body)

    // validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        status: "error",
        message: "Required fields missing",
      });
    }

    // save in DB
    const support = await prisma.supportMessage.create({
      data: {
        fullName: name,
        email,
        phoneNumber:phone,
        role,
        subject,
        message,
      },
    });

    await sendEmail({
      from: process.env.EMAIL_SENDEREMAIL,
      to: "akshat.shah@aakrin.com",
      subject: `Support Request: ${subject}`,
      html: getSupportEmailTemplate({ name, email, phone, role, subject, message }),
    });

    return res.status(201).json({
      status: "success",
      message: "Support message sent successfully",
      data: support,
    });

  } catch (error) {
    console.error("Support error:", error);

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to send support message",
    });
  }
};