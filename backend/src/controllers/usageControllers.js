import prisma from "../config/prisma.js";

const getFeatureUsage = async (req, res) => {
  const { organizationId, id: userId } = req.user;

  const member = await prisma.organizationMember.findFirst({
    where: { organizationId, userId },
  });

  if (!member) {
    return res.status(200).json({
      status: "success",
      message: "No active license found",
    });
  }

  // 🔥 DIRECT LICENSE FETCH (BEST)
  const license = await prisma.license.findFirst({
    where: {
      assignedToId: member.id,
      isActive: true,
      // validFrom: { lte: new Date() },
      // validUntil: { gte: new Date() },
    },
    orderBy: { validUntil: "desc" },
    include: {
      plan: { include: { limits: true } },
      usageRecords: true, // ⚠️ this works only if relation exists
    },
  });

  if (!license) {
    return res.status(200).json({
      status: "success",
      message: "No active license found",
    });
  }

  const now = new Date();

  const usage = license.plan.limits.map((limit) => {
    const record = license.usageRecords?.find(
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
    plan: license.plan.tier,
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
    take: 50,
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

    const subscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        seats: {
          include: {
            licenses: {
              where: {
                isActive: true,
                validFrom: { lte: new Date() },
                validUntil: { gte: new Date() },
              },
              orderBy: {
                validUntil: "desc",
              },
              take: 1, // 🔥 ONLY ONE
              include: { plan: true },
            },
            assignedTo: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
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

    const seats = subscription.seats;
    const totalSeats = seats.length;
    const activeSeats = seats.filter((s) => s.licenses.length > 0).length;
    const assignedSeats = seats.filter((s) => !!s.assignedToId).length;
    const unassignedSeats = totalSeats - assignedSeats;

    const licenseDetails = seats.map((seat) => {
      const license = seat.licenses?.[0] || null;

      return {
        seatId: seat.id,
        planTier: license?.plan.tier ?? null,
        validFrom: license?.validFrom ?? null,
        validUntil: license?.validUntil ?? null,
        isActive: !!license,
        assignedTo: seat.assignedTo
          ? {
              memberId: seat.assignedTo.id,
              userId: seat.assignedTo.user.id,
              name: seat.assignedTo.user.name,
              email: seat.assignedTo.user.email,
            }
          : null,
      };
    });

    res.json({
      subscriptionId: subscription.id,
      totalSeats,
      activeSeats,
      assignedSeats,
      unassignedSeats,
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
