import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const sendInvite = async (req, res) => {
  try {
    const { name, email, role = "COMPANY_USER" } = req.body;
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    if (!organizationId) {
      return res.status(400).json({
        status: "error",
        message: "User is not part of an organization",
      });
    }

    // 🔥 Check inviter is COMPANY_ADMIN
    const orgMember = await prisma.organizationMember.findUnique({
      where: { userId },
    });

    if (!orgMember || orgMember.role !== "COMPANY_ADMIN") {
      return res.status(403).json({
        status: "error",
        message: "Only company admin can send invites",
      });
    }

    // 🔥 Get ACTIVE subscription
    const subscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        licenses: {
          include: { plan: true },
        },
      },
    });

    if (!subscription) {
      return res.status(403).json({
        status: "error",
        message: "No active subscription found",
      });
    }

    const activeLicenses = subscription.licenses.filter(
      (l) => l.isActive && l.validUntil >= new Date(),
    );

    if (activeLicenses.length === 0) {
      return res.status(403).json({
        status: "error",
        message: "No active licenses found",
      });
    }

    // 🔥 Check paid plan (exclude BASIC)
    const planTier = activeLicenses[0].plan.tier;

    if (planTier === "BASIC") {
      return res.status(403).json({
        status: "error",
        message: "Invites are not available on Basic plan. Please upgrade.",
      });
    }

    // 🔥 Check seat availability
    const assignedSeats = activeLicenses.filter(
      (l) => l.assignedToId !== null,
    ).length;

    const availableSeats = activeLicenses.length - assignedSeats;

    if (availableSeats <= 0) {
      return res.status(403).json({
        status: "error",
        message: "No available seats. Please purchase additional licenses.",
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

    await prisma.organizationInvite.create({
      data: {
        email,
        organizationId,
        role,
        permissions: "FULL_ACCESS",
        token,
        expiresAt,
      },
    });

   const acceptLink = `${process.env.FRONTEND_URL}/createpassword?email=${encodeURIComponent(
  email
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
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;
    const userId = req.user.id;

    await prisma.$transaction(async (tx) => {
      const invite = await tx.organizationInvite.findUnique({
        where: { token },
      });

      if (!invite) {
        throw new Error("Invalid or expired invite");
      }

      if (new Date() > invite.expiresAt) {
        throw new Error("Invite expired");
      }

      // 🔥 Get ACTIVE subscription
      const subscription = await tx.organizationSubscription.findFirst({
        where: {
          organizationId: invite.organizationId,
          status: "ACTIVE",
        },
      });

      if (!subscription) {
        throw new Error("No active subscription found");
      }

      // 🔥 Find available seat
      const freeLicense = await tx.license.findFirst({
        where: {
          subscriptionId: subscription.id,
          isActive: true,
          assignedToId: null,
          validUntil: { gte: new Date() },
        },
        orderBy: {
          validUntil: "asc",
        },
      });

      if (!freeLicense) {
        throw new Error("No available license seat");
      }

      // 🔥 Create org member
      const newMember = await tx.organizationMember.create({
        data: {
          userId,
          organizationId: invite.organizationId,
          role: invite.role,
          permissions: invite.permissions,
        },
      });

      // 🔥 Assign seat
      await tx.license.update({
        where: { id: freeLicense.id },
        data: {
          assignedToId: newMember.id,
        },
      });

      // 🔥 Delete invite
      await tx.organizationInvite.delete({
        where: { id: invite.id },
      });
    });

    res.status(200).json({
      status: "success",
      message: "Invite accepted and license assigned",
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      status: "error",
      message: error.message || "Server Error",
    });
  }
};

export const rejectInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return res.send("<h2>Invite already processed</h2>");
    }

    // Delete user
    await prisma.users.delete({
      where: { email: invite.email },
    });

    // Delete invite
    await prisma.organizationInvite.delete({
      where: { token },
    });

    res.send("<h2>Invitation rejected successfully</h2>");
  } catch (error) {
    console.error(error);
    res.status(500).send("<h2>Server Error</h2>");
  }
};
