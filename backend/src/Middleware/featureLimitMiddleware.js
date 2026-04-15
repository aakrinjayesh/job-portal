import prisma from "../config/prisma.js";
import { getPeriodBounds } from "../utils/getPeriodBounds.js";

const FEATURE_MAP = [
  {
    match: (path, method) =>
      method === "POST" && path.includes("/apply-candidate"),
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

  {
    match: (path, method) => method === "POST" && path.includes("/upload"),
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

    console.log("METHOD:", req.method);
    console.log("path:", req.path);
    const route = FEATURE_MAP.find((r) => r.match(req.path, req.method));
    console.log("route in feature Middleware matched", route);
    if (!route) return next();

    const { id: userId, organizationId } = req.user;
    const { feature, usesAI } = route;

    // ─── 1. Get member ─────────────────────────────────────────
    const member = await prisma.organizationMember.findUnique({
      where: { userId },
    });

    if (!member) {
      return res.status(403).json({
        status: "error",
        code: "NO_ACTIVE_LICENSE",
        message: "No Active License Found",
        metadata: { organizationId, feature },
      });
    }

    // ─── 2. Get license ────────────────────────────────────────
    const license = await prisma.license.findFirst({
      where: {
        assignedToId: member.id,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });

    if (!license) {
      return res.status(403).json({
        status: "error",
        code: "NO_ACTIVE_LICENSE",
        message: "No Active License Found",
        metadata: { organizationId, feature },
      });
    }

    // ─── 3. Expiry check ───────────────────────────────────────
    const isBasicPlan = license.plan.tier === "BASIC";

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

    // ─── 4. Load limits ────────────────────────────────────────
    const limits = await prisma.planLimit.findMany({
      where: { planId: license.planId, feature },
    });

    if (!limits.length) return next();

    // ─── 5. Enforce limits ─────────────────────────────────────
    for (const limit of limits) {
      const { start, end } = getPeriodBounds(limit.period);

      // STEP 1: Find record
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

      // STEP 2: Create if not exists (with race-condition handling)
      if (!record) {
        try {
          record = await prisma.usageRecord.create({
            data: {
              licenseId: license.id,
              seatId: license.seatId,
              feature,
              period: limit.period,
              periodStart: start,
              periodEnd: end,
              currentUsage: 0, // IMPORTANT
            },
          });
        } catch (err) {
          // If another request created it
          record = await prisma.usageRecord.findUnique({
            where: {
              licenseId_feature_period_periodStart: {
                licenseId: license.id,
                feature,
                period: limit.period,
                periodStart: start,
              },
            },
          });
        }
      }

      // ─── AI Routes (no increment here) ───────────────────────
      // if (usesAI) {
      //   if (
      //     limit.maxAllowed !== -1 &&
      //     record.currentUsage >= limit.maxAllowed
      //   ) {
      //     return res.status(403).json({
      //       status: "error",
      //       code: "LIMIT_EXCEEDED",
      //       message: `${feature} ${limit.period.toLowerCase()} limit exceeded`,
      //       metadata: {
      //         feature,
      //         period: limit.period,
      //         maxAllowed: limit.maxAllowed,
      //         currentUsage: record.currentUsage,
      //         licenseId: license.id,
      //         planId: license.planId,
      //       },
      //     });
      //   }

      //   continue;
      // }
      if (usesAI) {
        // 1. Check limit
        if (
          limit.maxAllowed !== -1 &&
          record.currentUsage >= limit.maxAllowed
        ) {
          return res.status(403).json({
            status: "error",
            code: "LIMIT_EXCEEDED",
            message: `${feature} ${limit.period.toLowerCase()} limit exceeded`,
          });
        }

        // 2. ✅ ADD THIS (MOST IMPORTANT FIX)
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: {
            currentUsage: { increment: 1 },
          },
        });

        continue;
      }

      // ─── Non-AI Routes: increment safely ─────────────────────

      if (limit.maxAllowed === -1) {
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: { currentUsage: { increment: 1 } },
        });
        continue;
      }

      const updated = await prisma.usageRecord.updateMany({
        where: {
          id: record.id,
          currentUsage: { lt: limit.maxAllowed },
        },
        data: { currentUsage: { increment: 1 } },
      });

      if (updated.count === 0) {
        return res.status(403).json({
          status: "error",
          code: "LIMIT_EXCEEDED",
          message: `${feature} ${limit.period.toLowerCase()} limit exceeded`,
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

    // ─── 6. Attach AI metadata ────────────────────────────────
    if (usesAI) {
      req.aiLimitCheckPassed = true;
      req.aiLimitMeta = {
        licenseId: license.id,
        seatId: license.seatId,
        organizationId,
        userId,
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
