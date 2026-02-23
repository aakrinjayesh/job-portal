import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.SENDEREMAIL,
      pass: process.env.SENDERPASS,
    },
  });

  // 1️⃣ Create initial log
  const log = await prisma.emailLog.create({
    data: {
      to: options.to,
      subject: options.subject,
      status: "PENDING",
      provider: "gmail",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SENDEREMAIL,
      ...options,
    });

    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
        messageId: info.messageId,
        response: info.response,
      },
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        error: error.message,
        retries: { increment: 1 },
      },
    });

    console.error("❌ Email failed:", error.message);
    throw error;
  }
};

export default sendEmail;
