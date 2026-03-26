import prisma from "../config/prisma.js";
import { getPeriodBounds } from "../utils/getPeriodBounds.js";

const FEATURE_MAP = [
  {
    match: (path, method) =>
      method === "POST" && path === "/vendor/apply-candidate",
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

    console.log("path:", req.path);
    const route = FEATURE_MAP.find((r) => r.match(req.path, req.method));
    console.log("route in feature Middleware matched", route);
    if (!route) return next();

    const { id: userId, organizationId } = req.user;
    const { feature, usesAI } = route;

    // ─── 1. Get the member's active license ───────────────────────────────────
    // FIX: schema has License[] on OrganizationMember (not a singular `license`
    // relation). We must query License directly, filtering by assignedToId and
    // isActive, and join the plan ourselves.
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

    // ─── 2. Check expiry (skip for BASIC tier — it never expires) ─────────────
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

    // ─── 3. Load plan limits for this feature ─────────────────────────────────
    const limits = await prisma.planLimit.findMany({
      where: { planId: license.planId, feature },
    });

    // No limits configured for this feature → allow freely
    if (!limits.length) return next();

    // ─── 4. Enforce each period limit ─────────────────────────────────────────
    for (const limit of limits) {
      const { start, end } = getPeriodBounds(limit.period);

      // Upsert the usage record so we always have a row to work with
      let record = await prisma.usageRecord.upsert({
        where: {
          licenseId_feature_period_periodStart: {
            licenseId: license.id,
            feature,
            period: limit.period,
            periodStart: start,
          },
        },
        create: {
          licenseId: license.id,
          seatId: license.seatId,
          feature,
          period: limit.period,
          periodStart: start,
          periodEnd: end,
          currentUsage: { increment: 1 },
        },
        update: {}, // no-op update; we only want the row to exist
      });

      if (usesAI) {
        // ── AI routes: gate only, increment happens in the controller after
        //    the AI call succeeds so a failed call doesn't burn quota.
        if (
          limit.maxAllowed !== -1 &&
          record.currentUsage >= limit.maxAllowed
        ) {
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

        continue; // skip increment — controller handles it
      }

      // ── Non-AI routes: increment atomically right here ────────────────────

      // Unlimited (-1) → increment without a ceiling check
      if (limit.maxAllowed === -1) {
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: { currentUsage: { increment: 1 } },
        });
        continue;
      }

      // Limited → atomic conditional increment (prevents over-counting under
      // concurrent requests without needing a transaction)
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

    // ─── 5. Attach AI metadata for the controller to increment after success ──
    if (usesAI) {
      req.aiLimitCheckPassed = true;
      req.aiLimitMeta = {
        licenseId: license.id,
        seatId: license.seatId,
        organizationId,
        userId,
        feature,
        limits, // full PlanLimit objects so controller can call getPeriodBounds again
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
