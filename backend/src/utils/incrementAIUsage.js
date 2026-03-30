import prisma from "../config/prisma.js";
import { getPeriodBounds } from "./getPeriodBounds.js";

export const incrementAIUsage = async (req, aiResult) => {
  try {
    if (!req.aiLimitCheckPassed || !req.aiLimitMeta) return;

    const { seatId, licenseId, organizationId, userId, feature, limits } =
      req.aiLimitMeta;

    const { tokenUsage } = aiResult || {};

    // 1️⃣ Increment UsageRecord (request count) — keyed by seatId
    for (const limit of limits) {
      const { start } = getPeriodBounds(limit.period);

      await prisma.usageRecord.updateMany({
        where: {
          seatId,
          feature,
          period: limit.period,
          periodStart: start,
        },
        data: { currentUsage: { increment: 1 } },
      });
    }

    // 2️⃣ Insert into AITokenUsage — seatId required, licenseId optional audit
    await prisma.aITokenUsage.create({
      data: {
        organizationId,
        userId,
        seatId,
        licenseId: licenseId ?? null,
        inputTokens: tokenUsage?.prompt || 0,
        outputTokens: tokenUsage?.completion || 0,
        totalTokens: tokenUsage?.total || 0,
        featureUsed: feature,
      },
    });
  } catch (error) {
    console.error("AI Usage Increment Failed:", error.message);
  }
};
