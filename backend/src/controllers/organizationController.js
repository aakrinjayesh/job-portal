import prisma from "../config/prisma.js";
import { handleError } from "../utils/handleError.js";

// Get all members of the organization
export const getOrganizationMembers = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        status: "error",
        message: "User is not part of an organization",
      });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileUrl: true,
          },
        },
        seats: {
          take: 1, // ✅ ensure only one seat (latest)
          orderBy: {
            createdAt: "desc", // optional but recommended
          },
          include: {
            licenses: {
              where: {
                isActive: true,
                validFrom: {
                  lte: new Date(), // ✅ already started
                },
                validUntil: {
                  gte: new Date(), // ✅ not expired
                },
              },
              orderBy: {
                validUntil: "desc", // ✅ latest valid license
              },
              take: 1, // ✅ only one license
              include: {
                plan: {
                  select: {
                    tier: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Normalize response
    const normalizedMembers = members.map((m) => {
      const seat = m.seats?.[0] || null;
      const license = seat?.licenses?.[0] || null;

      const { seats, ...rest } = m;

      return {
        ...rest,
        seatId: seat?.id ?? null,
        license,
      };
    });

    // Fetch pending invites
    const invites = await prisma.organizationInvite.findMany({
      where: { organizationId },
    });

    return res.status(200).json({
      status: "success",
      data: {
        members: normalizedMembers,
        invites,
      },
    });
  } catch (error) {
    console.error("getOrganizationMembers Error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// Remove a member
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const organizationId = req.user.organizationId;

    // Check permission (Only ADMIN or with specific permission could do this, sticking to OWNER/ADMIN for now)
    // Assuming req.user has role/permission populated by middleware

    // Simplified check: Ensure member belongs to acting user's org
    const memberToDelete = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToDelete || memberToDelete.organizationId !== organizationId) {
      return res.status(404).json({
        status: "error",
        message: "Member not found in your organization",
      });
    }

    if (memberToDelete.userId === currentUser.id) {
      return res.status(400).json({
        status: "error",
        message: "You cannot remove yourself",
      });
    }

    await prisma.organizationMember.delete({ where: { id: memberId } });

    res
      .status(200)
      .json({ status: "success", message: "Member removed successfully" });
  } catch (error) {
    console.error(error);
    handleError(error, req, res);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// Delete an invite
export const deleteInviteByAdmin = async (req, res) => {
  try {
    const { inviteId } = req.body;
    const organizationId =
      req.user.organizationId || req.user.organizationMember?.organizationId;

    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.organizationId !== organizationId) {
      return res
        .status(404)
        .json({ status: "error", message: "Invite not found" });
    }

    // Delete the user stub created during invite (only if they haven't set a password yet)
    const stubUser = await prisma.users.findUnique({
      where: { email: invite.email },
      select: { id: true, password: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.organizationInvite.delete({ where: { id: inviteId } });

      // Only delete the user stub if they never set a password (invite not accepted)
      if (stubUser && !stubUser.password) {
        await tx.users.delete({ where: { id: stubUser.id } });
      }
    });

    res
      .status(200)
      .json({ status: "success", message: "Invite revoked successfully" });
  } catch (error) {
    console.error(error);
    handleError(error, req, res);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};
