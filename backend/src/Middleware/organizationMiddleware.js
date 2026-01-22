import prisma from "../config/prisma.js";

export const ensureCompanyAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied: Not a company user",
      });
    }

    const membership = await prisma.organizationMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership || membership.role !== "COMPANY_ADMIN") {
      return res.status(403).json({
        status: "error",
        message: "Only organization admins can perform this action",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to verify admin permission",
    });
  }
};



export const ensureCompanyMember = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "company") {
      return res.status(403).json({
        status: "error",
        message: "Access denied: Not a company user",
      });
    }

    if (!user.organizationId) {
      return res.status(403).json({
        status: "error",
        message: "Organization missing for this user",
      });
    }

    const membership = await prisma.organizationMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership) {
      return res.status(403).json({
        status: "error",
        message: "You are not a member of this organization",
      });
    }

    // Attach membership info for convenience
    req.orgMember = membership;

    next();
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to verify organization membership",
    });
  }
};
