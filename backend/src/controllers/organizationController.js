import prisma from "../config/prisma.js";

// Get all members of the organization
export const getOrganizationMembers = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        if (!organizationId) {
            return res.status(400).json({ status: "error", message: "User is not part of an organization" });
        }

        const members = await prisma.organizationMember.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileUrl: true
                    }
                }
            }
        });

        // Also fetch pending invites
        const invites = await prisma.organizationInvite.findMany({
            where: { organizationId }
        });

        res.status(200).json({
            status: "success",
            data: { members, invites }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server Error" });
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
            where: { id: memberId }
        });

        if (!memberToDelete || memberToDelete.organizationId !== organizationId) {
            return res.status(404).json({ status: "error", message: "Member not found in your organization" });
        }

        // Prevent removing self if it leaves org empty? (Optional)

        await prisma.organizationMember.delete({ where: { id: memberId } });

        res.status(200).json({ status: "success", message: "Member removed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server Error" });
    }
};

// Delete an invite
export const deleteInviteByAdmin = async (req, res) => {
    try {
        const { inviteId } = req.body;
        const organizationId = req.user.organizationId || req.user.organizationMember?.organizationId;

        const invite = await prisma.organizationInvite.findUnique({ where: { id: inviteId } });

        if (!invite || invite.organizationId !== organizationId) {
            return res.status(404).json({ status: "error", message: "Invite not found" });
        }

        await prisma.organizationInvite.delete({ where: { id: inviteId } });

        res.status(200).json({ status: "success", message: "Invite revoked successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server Error" });
    }
}
