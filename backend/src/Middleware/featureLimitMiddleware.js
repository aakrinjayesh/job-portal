import prisma from "../config/prisma.js";
import { getPeriodBounds } from "../utils/getPeriodBounds.js";

const FEATURE_MAP = [
  {
    match: (path, method) =>
      method === "POST" && path === "/vendor/apply-candidate",
    feature: "JOB_APPLICATIONS",
    usesAI: true,
  },
  {
    match: (path, method) =>
      method === "GET" && /^\/vendor\/candidates\/[^/]+$/.test(path),
    feature: "CANDIDATE_PROFILE_VIEWS",
    usesAI: false,
  },
  {
    match: (path, method) => method === "POST" && path === "/jobs/create",
    feature: "JOB_POST_CREATION",
    usesAI: false,
  },
  // {
  //   match: (path, method) =>
  //     method === "POST" && path === "/organization/invite",
  //   feature: "TEAM_MEMBERS",
  //   usesAI: false,
  // },
];

export const featureLimitMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.organizationId) return next();

    const route = FEATURE_MAP.find((r) => r.match(req.path, req.method));

    if (!route) return next();

    const { id: userId, organizationId } = req.user;
    const { feature, usesAI } = route;

    // 1️⃣ Get member + license
    const member = await prisma.organizationMember.findUnique({
      where: { userId },
      include: { license: true },
    });

    if (!member?.license || !member.license.isActive) {
      return res.status(200).json({
        status: "success",
        code: "NO_ACTIVE_LICENSE",
        message: "No Active License Found",
        metadata: {
          organizationId,
          feature,
        },
      });
    }

    const license = member.license;

    if (license.validUntil < new Date()) {
      return res.status(200).json({
        status: "success",
        code: "LICENSE_EXPIRED",
        message: "License Has Expired",
        metadata: {
          licenseId: license.id,
          planId: license.planId,
          validUntil: license.validUntil,
        },
      });
    }

    // 2️⃣ Get limits for this feature
    const limits = await prisma.planLimit.findMany({
      where: { planId: license.planId, feature },
    });

    if (!limits.length) return next();

    // 3️⃣ Enforce each period
    for (const limit of limits) {
      const { start, end } = getPeriodBounds(limit.period);

      let record = await prisma.usageRecord.findUnique({
        where: {
          licenseId_feature_period_periodStart: {
            licenseId: license.id,
            feature,
            period: limit.period,
            periodStart: start,
          },
        },
      });

      if (!record) {
        record = await prisma.usageRecord.create({
          data: {
            licenseId: license.id,
            feature,
            period: limit.period,
            periodStart: start,
            periodEnd: end,
          },
        });
      }

      const updated = await prisma.usageRecord.updateMany({
        where: {
          id: record.id,
          currentUsage: { lt: limit.maxAllowed },
        },
        data: {
          currentUsage: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        return res.status(200).json({
          status: "success",
          code: "LIMIT_EXCEEDED",
          message: `${feature} ${limit.period.toLowerCase()} Limit Exceeded`,
          metadata: {
            feature,
            period: limit.period,
            maxAllowed: limit.maxAllowed,
            currentUsage: record.currentUsage,
            licenseId: license.id,
            planId: license.planId,
          },
        });
      }
    }

    // 4️⃣ AI routes marker
    if (usesAI) req.aiLimitCheckPassed = true;

    next();
  } catch (err) {
    console.error("Limit middleware error:", err);
    return res.status(200).json({
      status: "success",
      code: "LIMIT_ENFORCEMENT_FAILED",
      message: "Unable to enforce feature limits",
      metadata: {
        error: err.message,
      },
    });
  }
};
