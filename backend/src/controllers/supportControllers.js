import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";

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

    // mail content
    const mailSubject = `Support Request: ${subject}`;

    const mailHTML = `
      <h3>New Support Request</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Role:</b> ${role || "-"}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `;

    // send mail
    await sendEmail({
      from: process.env.EMAIL_SENDEREMAIL,
      to: "akshat.shah@aakrin.com",
      subject: mailSubject,
      html: mailHTML,
    });

    return res.status(201).json({
      status: "success",
      message: "Support message sent successfully",
      data: support,
    });

  } catch (error) {
    console.error("Support error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to send support message",
    });
  }
};