import jwt from "jsonwebtoken";
import { ADMIN_EMAILS, ADMIN_PASSWORD } from "../config/adminConfig.js";
import prisma from "../../config/prisma.js"; // adjust path to your prisma client

const adminLogin = async (req, res) => {
  const { email: em, password } = req.body;

  if (!em || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  const email = em.toLowerCase().trim();

  // 1️⃣ Check if email is in allowed list
  const isAllowedEmail = ADMIN_EMAILS.includes(email);
  if (!isAllowedEmail) {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials",
    });
  }

  // 2️⃣ Check password
  const isMatch = password === ADMIN_PASSWORD;
  if (!isMatch) {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials",
    });
  }

  // 3️⃣ Sign JWT
  const token = jwt.sign(
    { email }, // payload — no role
    process.env.SECRETKEY, // secret
    { expiresIn: "8h" }, // options
  );

  return res.status(200).json({
    status: "success",
    message: "Admin logged in successfully",
    token,
    admin: { email },
  });
};

const getAdminStats = async (req, res) => {
  try {
    const [
      totalCandidates,
      totalCompanies,
      totalJobs,
      totalOrganizations,
      totalApplications,
      recentUsers,
    ] = await Promise.all([
      // Total candidates
      prisma.users.count({
        where: { role: "candidate" },
      }),

      // Total companies
      prisma.users.count({
        where: { role: "company" },
      }),

      // Total jobs
      prisma.job.count({
        where: { isDeleted: false },
      }),

      // Total organizations
      prisma.organization.count(),

      // Total applications
      prisma.jobApplication.count(),

      // Recent 5 users
      prisma.users.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailverified: true,
        },
      }),
    ]);

    return res.status(200).json({
      status: "success",
      stats: {
        totalCandidates,
        totalCompanies,
        totalJobs,
        totalOrganizations,
        totalApplications,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("getAdminStats error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const executeQuery = async (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Query is required",
    });
  }

  // 🔒 Block dangerous operations
  const forbidden = ["drop", "truncate", "delete", "insert", "update", "alter", "create", "grant", "revoke"];
  const queryLower = query.trim().toLowerCase();
  const hasForbidden = forbidden.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`);
    return regex.test(queryLower);
  });

  if (hasForbidden) {
    return res.status(403).json({
      status: "error",
      message: "Only SELECT queries are allowed for safety",
    });
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);

    // Convert BigInt to Number for JSON serialization
    const sanitized = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.status(200).json({
      status: "success",
      rows: sanitized,
      count: sanitized.length,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};



// 📋 Get all organizations with summary
const getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? { name: { contains: search, mode: "insensitive" } }
      : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          companyProfile: {
            select: {
              logoUrl: true,
              website: true,
              industry: true,
              companySize: true,
              headquarters: true,
            },
          },
          members: { select: { id: true, role: true } },
          subscription: {
            select: {
              status: true,
              billingCycle: true,
              currentPeriodEnd: true,
            },
          },
          invites: { select: { id: true } },
          _count: {
            select: {
              jobs: true,
              jobApplications: true,
              members: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return res.status(200).json({
      status: "success",
      organizations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 🔍 Get single organization full details
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        companyProfile: true,
        address: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileUrl: true,
                createdAt: true,
              },
            },
            // ✅ correct relation name from schema
            licenses: {
              select: {
                id: true,
                isActive: true,
                validUntil: true,
                plan: { select: { tier: true, name: true } },
              },
            },
          },
        },
        subscription: {
          include: {
            seats: true,
            licenses: {
              include: {
                plan: { select: { tier: true, name: true } },
                assignedTo: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
            invoices: {
               periodStart: "desc",
              take: 5,
            },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        },
        invites: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        _count: {
          select: {
            jobs: true,
            jobApplications: true,
            members: true,
            invites: true,
          },
        },
      },
    });

    if (!org) {
      return res.status(404).json({
        status: "error",
        message: "Organization not found",
      });
    }

    return res.status(200).json({ status: "success", organization: org });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ❌ Delete organization
 const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.organization.delete({ where: { id } });
    return res.status(200).json({
      status: "success",
      message: "Organization deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 🔄 Update subscription status
// export const updateSubscriptionStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const updated = await prisma.organizationSubscription.update({
//       where: { organizationId: id },
//       data: { status },
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Subscription status updated",
//       subscription: updated,
//     });
//   } catch (error) {
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// ❌ Remove member from organization
 const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    await prisma.organizationMember.delete({ where: { id: memberId } });
    return res.status(200).json({
      status: "success",
      message: "Member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};



export { adminLogin, 
  getAdminStats, 
  executeQuery,
  getAllOrganizations,
  getOrganizationById,
  deleteOrganization,
  removeMember
};