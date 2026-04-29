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
              // industry: true,
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
  orderBy: {
    periodStart: "desc",   // ✅ correct
  },
  take: 5,
},
          payments: {
  orderBy: {
    id: "desc" // fallback sorting
  },
  take: 5
}
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
        jobs: {
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        employmentType: true,
        jobType: true,
        status: true,
        salary: true,
        location: true,
        createdAt: true,
        _count: { select: {  applications: true, } },
      },
    },
       _count: {
  select: {
            jobs: true,
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

// 📋 Get all plan limits (grouped by plan)
const getPlanLimits = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        limits: true,
      },
      orderBy: { monthlyPrice: "asc" },
    });

    return res.status(200).json({ status: "success", plans });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ✏️ Upsert a plan limit (create or update)
const upsertPlanLimit = async (req, res) => {
  try {
    const { planId, feature, period, maxAllowed, planName } = req.body;

    if (!planId || !feature || !period || maxAllowed === undefined) {
      return res.status(400).json({
        status: "error",
        message: "planId, feature, period, and maxAllowed are required",
      });
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ status: "error", message: "Plan not found" });
    }

    const limit = await prisma.planLimit.upsert({
      where: { planId_feature_period: { planId, feature, period } },
      update: { maxAllowed: parseInt(maxAllowed) },
      create: {
        planId,
        planName: planName || plan.name,
        feature,
        period,
        maxAllowed: parseInt(maxAllowed),
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Plan limit saved successfully",
      limit,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ✏️ Bulk upsert limits for a single plan
const bulkUpsertPlanLimits = async (req, res) => {
  try {
    const { planId, limits } = req.body;
    // limits: [{ feature, period, maxAllowed }]

    if (!planId || !Array.isArray(limits) || limits.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "planId and limits[] are required",
      });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ status: "error", message: "Plan not found" });
    }

    const results = await prisma.$transaction(
      limits.map(({ feature, period, maxAllowed }) =>
        prisma.planLimit.upsert({
          where: { planId_feature_period: { planId, feature, period } },
          update: { maxAllowed: parseInt(maxAllowed) },
          create: {
            planId,
            planName: plan.name,
            feature,
            period,
            maxAllowed: parseInt(maxAllowed),
          },
        })
      )
    );

    return res.status(200).json({
      status: "success",
      message: `${results.length} limits updated`,
      limits: results,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ❌ Delete a specific plan limit
const deletePlanLimit = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.planLimit.delete({ where: { id } });

    return res.status(200).json({
      status: "success",
      message: "Plan limit deleted",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ✏️ Update plan pricing (monthlyPrice and/or yearlyPrice)
const updatePlanPricing = async (req, res) => {
  try {
    const { planId } = req.params;
    const { monthlyPrice, yearlyPrice } = req.body;

    if (monthlyPrice === undefined && yearlyPrice === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Provide at least one of monthlyPrice or yearlyPrice",
      });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ status: "error", message: "Plan not found" });
    }

    // Only PROFESSIONAL and ORGANIZATION are editable from admin UI
    const EDITABLE_TIERS = ["PROFESSIONAL", "ORGANIZATION"];
    if (!EDITABLE_TIERS.includes(plan.tier)) {
      return res.status(403).json({
        status: "error",
        message: `Pricing for ${plan.tier} cannot be edited`,
      });
    }

    const data = {};
    if (monthlyPrice !== undefined) {
      const mo = parseInt(monthlyPrice);
      if (isNaN(mo) || mo < 0) {
        return res.status(400).json({ status: "error", message: "monthlyPrice must be a non-negative integer" });
      }
      data.monthlyPrice = mo;
    }
    if (yearlyPrice !== undefined) {
      const yr = parseInt(yearlyPrice);
      if (isNaN(yr) || yr < 0) {
        return res.status(400).json({ status: "error", message: "yearlyPrice must be a non-negative integer" });
      }
      data.yearlyPrice = yr;
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });

    return res.status(200).json({
      status: "success",
      message: "Plan pricing updated successfully",
      plan: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 💼 Admin: Post a job on behalf of an organization
const adminPostJob = async (req, res) => {
  try {
    const {
      // Admin provides these explicitly
      organizationId,
      postedById,       // optional: which org member to attribute the job to
      // Job fields (same as postJob)
      role,
      description,
      employmentType,
      experience,
      experienceLevel,
      tenure,
      location,
      skills,
      clouds,
      salary,
      companyName,
      responsibilities,
      certifications,
      jobType,
      applicationDeadline,
      ApplicationLimit,
      companyLogo,
      applicantSource,
      questions = [],
    } = req.body;

    // 1️⃣ Validate required fields
    if (!organizationId) {
      return res.status(400).json({
        status: "error",
        message: "organizationId is required",
      });
    }

    // 2️⃣ Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) {
      return res.status(404).json({
        status: "error",
        message: "Organization not found",
      });
    }

    // 3️⃣ Normalize tenure (same logic as postJob)
    let normalizedTenure = null;
    if (["PartTime", "Contract", "Freelancer"].includes(employmentType)) {
      const tenureNumber = tenure?.number;
      if (!tenureNumber) {
        return res.status(400).json({
          status: "error",
          message: "Tenure is required for Part Time / Contract jobs",
        });
      }
      normalizedTenure = {
        number: String(tenureNumber),
        type: tenure?.type || "month",
      };
    }

    // 4️⃣ Normalize applicant source
    const validSources = ["Candidate", "Company", "Both"];
    const normalizedSource = validSources.includes(applicantSource)
      ? applicantSource
      : "Both";

    // 5️⃣ Create job
    const job = await prisma.job.create({
      data: {
        role,
        description,
        employmentType,
        experience,
        experienceLevel,
        location,
        tenure: normalizedTenure,
        skills:           skills          || [],
        clouds:           clouds          || [],
        salary,
        companyName,
        responsibilities,
        certifications:   certifications  || [],
        jobType,
        applicationDeadline,
        ApplicationLimit,
        companyLogo,
        applicantSource:  normalizedSource,
        postedById:       postedById      || null,
        organizationId,
      },
    });

    // 6️⃣ Insert screening questions (same logic as postJob)
    if (Array.isArray(questions) && questions.length > 0) {
      const questionData = questions
        .filter(q => q?.question && q.question.trim() !== "")
        .map((q, index) => ({
          jobId:    job.id,
          question: q.question.trim(),
          type:     q.type     || "TEXT",
          options:  Array.isArray(q.options) ? q.options : [],
          required: q.required ?? true,
          order:    q.order    ?? index,
        }));

      if (questionData.length > 0) {
        await prisma.jobApplicationQuestion.createMany({ data: questionData });
      }
    }

    return res.status(201).json({
      status: "success",
      message: "Job posted successfully by admin",
      job,
    });
  } catch (error) {
    console.error("adminPostJob error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

export { adminLogin, 
  getAdminStats, 
  executeQuery,
  getAllOrganizations,
  getOrganizationById,
  deleteOrganization,
  removeMember,
   getPlanLimits,
  upsertPlanLimit,
  bulkUpsertPlanLimits,
  deletePlanLimit,
  updatePlanPricing,
  adminPostJob,
};