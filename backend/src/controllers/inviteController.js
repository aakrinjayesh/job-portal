import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { getInviteEmailTemplate } from "../utils/emailTemplates/InviteTemplates.js";

export const sendInvite = async (req, res) => {
  try {
    const {
      name,
      email,
      role = "COMPANY_USER",
      seatId,
      licenseId, // ✅ NEW
    } = req.body;

    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    if (!organizationId) {
      return res.status(400).json({
        status: "error",
        message: "User is not part of an organization",
      });
    }

    if (!seatId) {
      return res.status(400).json({
        status: "error",
        message: "Please select a seat to assign to the invited member",
      });
    }

    if (!licenseId) {
      return res.status(400).json({
        status: "error",
        message: "LicenseId is required",
      });
    }

    // 🔥 Check inviter is COMPANY_ADMIN
    // 🔥 Get org member
    const orgMember = await prisma.organizationMember.findUnique({
      where: { userId },
    });

    if (!orgMember || orgMember.role !== "COMPANY_ADMIN") {
      return res.status(403).json({
        status: "error",
        message: "Only company admin can send invites",
      });
    }

    // 🔥 Get admin's ACTIVE license directly (NO blind indexing)
    const adminLicense = await prisma.license.findFirst({
      where: {
        assignedToId: orgMember.id,
        isActive: true,
        validUntil: { gte: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: {
        validUntil: "desc", // ✅ pick latest valid license
      },
    });

    if (!adminLicense || adminLicense.plan.tier === "BASIC") {
      return res.status(403).json({
        status: "error",
        message: "Invites are not available on Basic plan. Please upgrade.",
      });
    }

    // 🔥 Validate subscription
    const subscription = await prisma.organizationSubscription.findFirst({
      where: { organizationId, status: "ACTIVE" },
    });

    if (!subscription) {
      return res.status(403).json({
        status: "error",
        message: "No active subscription found",
      });
    }

    // 🔥 Validate seat + license together
    const selectedSeat = await prisma.licenseSeat.findFirst({
      where: {
        id: seatId,
        subscriptionId: subscription.id,
        assignedToId: null,
      },
      include: {
        licenses: {
          where: {
            id: licenseId,
            isActive: true,
            validUntil: { gte: new Date() },
          },
        },
      },
    });

    if (!selectedSeat || selectedSeat.licenses.length === 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid seat or license. It may be expired, inactive, or not belong to this seat.",
      });
    }

    // 🔥 Prevent duplicate member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        status: "error",
        message: "User already in organization",
      });
    }

    // 🔥 Prevent duplicate invite
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: { email, organizationId },
    });

    if (existingInvite) {
      return res.status(400).json({
        status: "error",
        message: "Invite already sent",
      });
    }

    // 🔥 Create user stub
    await prisma.users.create({
      data: {
        name,
        email,
        role: "company",
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 🔥 Create invite with seat + license
    await prisma.organizationInvite.create({
      data: {
        email,
        organizationId,
        role,
        permissions: "FULL_ACCESS",
        token,
        expiresAt,
        seatId,
        licenseId, // ✅ NEW
      },
    });

    const acceptLink = `${process.env.FRONTEND_URL}/createpassword?email=${encodeURIComponent(
      email,
    )}&role=company&token=${token}`;

    await sendEmail({
      to: email,
      subject: "You're Invited to Join FORCEHEAD 🚀",
      html: getInviteEmailTemplate({ acceptLink }),
    });

    res.status(200).json({
      status: "success",
      message: "Invite sent successfully",
    });
  } catch (error) {
    console.log("send invite error", error.message);
    res.status(500).json({
      status: "error",
      message: "Server Error",
      metadata: error.message,
    });
  }
};
