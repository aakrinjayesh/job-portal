import prisma from "../config/prisma.js";
import { getPeriodBounds } from "../utils/getPeriodBounds.js";

const FEATURE_MAP = [
  {
    match: (path, method) =>
      method === "POST" && path === "/vendor/apply-candidate",
    // feature: "JOB_APPLICATIONS",
    feature: "APPLY_BENCH_TO_JOB",
    usesAI: true,
  },
  {
    match: (path, method) =>
      method === "GET" && /^\/candidates\/[^/]+$/.test(path),
    feature: "CANDIDATE_PROFILE_VIEWS",
    usesAI: false,
  },
  {
    match: (path, method) => method === "POST" && path === "/jobs/create",
    feature: "JOB_POST_CREATION",
    usesAI: false,
  },

  // 🔥 NEW AI FEATURES

  {
    match: (path, method) => method === "POST" && path === "/upload",
    feature: "RESUME_EXTRACTION",
    usesAI: true,
  },
  {
    match: (path, method) => method === "POST" && path === "/check-eligibility",
    feature: "AI_FIT_SCORE",
    usesAI: true,
  },
  {
    match: (path, method) =>
      method === "POST" && path === "/ai-candidate-filter",
    feature: "FIND_CANDIDATE_SEARCH",
    usesAI: true,
  },
  {
    match: (path, method) => method === "POST" && path === "/ai-job-filter",
    feature: "FIND_JOB_SEARCH",
    usesAI: true,
  },
  {
    match: (path, method) => method === "POST" && path === "/generate-jd",
    feature: "JD_EXTRACTION",
    usesAI: true,
  },
];

export const featureLimitMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.organizationId) return next();

    const route = FEATURE_MAP.find((r) => r.match(req.path, req.method));
    console.log("route in feature Middleware", route);
    if (!route) return next();

    const { id: userId, organizationId } = req.user;
    const { feature, usesAI } = route;

    // 1️⃣ Get organization member + license
    const member = await prisma.organizationMember.findUnique({
      where: { userId },
      include: { license: true },
    });

    if (!member?.license || !member.license.isActive) {
      return res.status(403).json({
        status: "error",
        code: "NO_ACTIVE_LICENSE",
        message: "No Active License Found",
        metadata: { organizationId, feature },
      });
    }

    const license = member.license;

    // 1️⃣ Check expiry ONLY for non-BASIC plans
    const isBasicPlan = license.planTier === "BASIC";

    if (!isBasicPlan && license.validUntil < new Date()) {
      return res.status(403).json({
        status: "error",
        code: "LICENSE_EXPIRED",
        message: "License Has Expired",
        metadata: {
          licenseId: license.id,
          planId: license.planId,
          validUntil: license.validUntil,
        },
      });
    }

    // 2️⃣ Get plan limits for feature
    const limits = await prisma.planLimit.findMany({
      where: { planId: license.planId, feature },
    });

    if (!limits.length) return next();

    // 3️⃣ Validate per period
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

      // Create usage record if not exists
      if (!record) {
        record = await prisma.usageRecord.create({
          data: {
            licenseId: license.id,
            feature,
            period: limit.period,
            periodStart: start,
            periodEnd: end,
            currentUsage: 0,
          },
        });
      }

      // 🔥 AI ROUTES → CHECK ONLY (NO INCREMENT HERE)
      if (usesAI) {
        if (
          limit.maxAllowed !== -1 &&
          record.currentUsage >= limit.maxAllowed
        ) {
          return res.status(403).json({
            status: "error",
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

        continue; // Skip increment
      }

      // 🔹 NON-AI ROUTES → INCREMENT IMMEDIATELY

      // Unlimited plan
      if (limit.maxAllowed === -1) {
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: {
            currentUsage: { increment: 1 },
          },
        });

        continue;
      }

      // Limited plan
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
        return res.status(403).json({
          status: "error",
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

    // 4️⃣ Attach AI metadata for controller increment
    if (usesAI) {
      req.aiLimitCheckPassed = true;
      req.aiLimitMeta = {
        licenseId: license.id,
        organizationId: req.user.organizationId,
        userId: req.user.id,
        feature,
        limits,
      };
    }

    next();
  } catch (err) {
    console.error("Limit middleware error:", err);
    return res.status(500).json({
      status: "error",
      code: "LIMIT_ENFORCEMENT_FAILED",
      message: "Unable to enforce feature limits",
      metadata: { error: err.message },
    });
  }
};
