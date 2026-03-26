import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; padding: 35px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 26px;">Welcome to FORCEHEAD 🚀</h1>
        <p style="margin: 10px 0 0; font-size: 15px; opacity: 0.9;">
          Salesforce B2B Hiring & Vendor Portal
        </p>
      </div>

      <!-- Body -->
      <div style="background: #f9fafb; padding: 35px; border-radius: 0 0 12px 12px;">

        <h2 style="color: #333; margin-top: 0;">You're Invited to Join an Organization</h2>

        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          You have been invited to join an organization on <strong>FORCEHEAD</strong>.
          Click the button below to set your password and activate your account.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptLink}"
             style="display: inline-block;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 8px;
                    font-size: 16px;">
            Accept Invitation
          </a>
        </div>

        <!-- Security Note -->
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-top: 25px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            🔒 For security reasons, this link may expire.
            If you did not expect this invitation, you can safely ignore this email.
          </p>
        </div>

        <p style="color: #666; font-size: 13px; margin-top: 30px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>

        <p style="word-break: break-all; font-size: 12px; color: #667eea;">
          ${acceptLink}
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message from FORCEHEAD. <br/>
          © ${new Date().getFullYear()} FORCEHEAD. All rights reserved.
        </p>

      </div>
    </div>
  `,
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
