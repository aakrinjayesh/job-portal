import prisma from "../config/prisma.js";

const getFeatureUsage = async (req, res) => {
  const { organizationId, id: userId } = req.user;

  // 1. Find org member + license
  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId },
    include: {
      license: {
        include: {
          plan: {
            include: { limits: true },
          },
          usageRecords: true,
        },
      },
    },
  });

  if (!member || !member.license) {
    return res
      .status(200)
      .json({ status: "success", message: "No active license found" });
  }

  const { plan, usageRecords } = member.license;
  const now = new Date();

  // 2. Build usage response
  const usage = plan.limits.map((limit) => {
    const record = usageRecords.find(
      (u) =>
        u.feature === limit.feature &&
        u.period === limit.period &&
        u.periodStart <= now &&
        u.periodEnd >= now,
    );

    const used = record?.currentUsage || 0;

    return {
      feature: limit.feature,
      period: limit.period,
      maxAllowed: limit.maxAllowed,
      used,
      remaining:
        limit.maxAllowed === -1 ? -1 : Math.max(limit.maxAllowed - used, 0),
      periodStart: record?.periodStart || null,
      periodEnd: record?.periodEnd || null,
    };
  });

  res.json({
    plan: plan.tier,
    usage,
  });
};

const getAIUsage = async (req, res) => {
  const { organizationId, id: userId } = req.user;

  // 1. Fetch AI usage records
  const records = await prisma.aITokenUsage.findMany({
    where: {
      organizationId,
      userId,
    },
    orderBy: { createdAt: "desc" },
    take: 50, // last 50 requests
  });

  // 2. Aggregate totals
  const totals = records.reduce(
    (acc, r) => {
      acc.inputTokens += r.inputTokens;
      acc.outputTokens += r.outputTokens;
      acc.totalTokens += r.totalTokens;
      return acc;
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  res.json({
    totals,
    history: records.map((r) => ({
      id: r.id,
      featureUsed: r.featureUsed,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      totalTokens: r.totalTokens,
      createdAt: r.createdAt,
    })),
  });
};

const getLicenseOverview = async (req, res) => {
  try {
    const { organizationId } = req.user;

    // 1️⃣ Get active subscription with licenses
    const subscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        licenses: {
          include: {
            plan: true,
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No active subscription found",
      });
    }

    const totalLicenses = subscription.licenses.length;
    const activeLicenses = subscription.licenses.filter(
      (l) => l.isActive,
    ).length;

    const assignedLicenses = subscription.licenses.filter(
      (l) => l.assignedToId,
    ).length;

    const unassignedLicenses = totalLicenses - assignedLicenses;

    const licenseDetails = subscription.licenses.map((license) => ({
      licenseId: license.id,
      planTier: license.plan.tier,
      validFrom: license.validFrom,
      validUntil: license.validUntil,
      isActive: license.isActive,
      assignedTo: license.assignedTo
        ? {
            memberId: license.assignedTo.id,
            userId: license.assignedTo.user.id,
            name: license.assignedTo.user.name,
            email: license.assignedTo.user.email,
          }
        : null,
    }));

    res.json({
      subscriptionId: subscription.id,
      totalLicenses,
      activeLicenses,
      assignedLicenses,
      unassignedLicenses,
      licenses: licenseDetails,
    });
  } catch (error) {
    console.error("License Overview Error:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export { getAIUsage, getFeatureUsage, getLicenseOverview };
