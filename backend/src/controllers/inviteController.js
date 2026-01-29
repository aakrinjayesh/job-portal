import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

export const sendInvite = async (req, res) => {
  try {
    const { email, role = "COMPANY_USER", permissions } = req.body;
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "User is not part of an organization",
        });
    }

    // Check existing membership
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ status: "error", message: "User already in organization" });
    }

    // Check existing invite
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: { email, organizationId },
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ status: "error", message: "Invite already sent" });
    }

    // Create user immediately
    const name = email.split("@")[0];

    const user = await prisma.users.create({
      data: {
        name,
        email,
        role: "company",
      },
    });

    console.log("user", user);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.organizationInvite.create({
      data: {
        email,
        // userId: user.id,
        organizationId,
        role: role || "COMPANY_USER",
        permissions: permissions || "VIEW_ONLY",
        token,
        expiresAt,
      },
    });

    console.log("invite", invite);

    // const acceptLink = `${process.env.FRONTEND_URL}/createpassword`;
    const acceptLink = `${process.env.FRONTEND_URL}/createpassword?email=${encodeURIComponent(
      email,
    )}&role=company&token=${token}`;
    const rejectLink = `${process.env.BACKEND_URL}/api/v1/organization/invite/reject?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Organization Invitation",
      html: `
        <h2>You are invited to join an organization</h2>
        <a href="${acceptLink}" style="padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;">Accept</a>
        <br/><br/>
        <a href="${rejectLink}" style="padding:10px 20px;background:#f44336;color:#fff;text-decoration:none;">Reject</a>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Invite sent and user created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired invite" });
    }

    if (new Date() > invite.expiresAt) {
      return res
        .status(400)
        .json({ status: "error", message: "Invite expired" });
    }

    // Frontend will handle password setup
    return res.status(200).json({
      status: "success",
      redirectTo: `/set-password?token=${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server Error" });
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

export const confirmInviteSwitch = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  await prisma.$transaction(async (tx) => {
    const invite = await tx.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite || new Date() > invite.expiresAt) {
      throw new Error("Invalid or expired invite");
    }

    const currentMembership = await tx.organizationMember.findFirst({
      where: { userId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    // 🧹 REMOVE FROM OLD ORG
    if (currentMembership) {
      const members = currentMembership.organization.members;

      if (members.length === 1) {
        // User is sole member → delete org
        await tx.organization.delete({
          where: { id: currentMembership.organizationId },
        });
      } else {
        // Reassign admin
        const newAdmin = members.find((m) => m.userId !== userId);

        await tx.organizationMember.update({
          where: { id: newAdmin.id },
          data: { role: "ADMIN" },
        });

        await tx.organizationMember.delete({
          where: { id: currentMembership.id },
        });
      }
    }

    // ➕ ADD TO NEW ORG
    await tx.organizationMember.create({
      data: {
        userId,
        organizationId: invite.organizationId,
        role: invite.role,
        permissions: invite.permissions,
      },
    });

    // ❌ DELETE INVITE
    await tx.organizationInvite.delete({
      where: { id: invite.id },
    });
  });

  res.status(200).json({
    status: "success",
    message: "Organization switched successfully",
  });
};
