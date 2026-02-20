import prisma from "../config/prisma.js";
import { getPeriodBounds } from "./getPeriodBounds.js";

export const incrementAIUsage = async (req, aiResult) => {
  try {
    if (!req.aiLimitCheckPassed || !req.aiLimitMeta) return;

    const { licenseId, organizationId, userId, feature, limits } =
      req.aiLimitMeta;

    const { tokenUsage } = aiResult || {};

    // 1️⃣ Increment UsageRecord (request count)
    for (const limit of limits) {
      const { start } = getPeriodBounds(limit.period);

      await prisma.usageRecord.updateMany({
        where: {
          licenseId,
          feature,
          period: limit.period,
          periodStart: start,
        },
        data: {
          currentUsage: { increment: 1 },
        },
      });
    }

    // 2️⃣ Insert into AITokenUsage table
    await prisma.aITokenUsage.create({
      data: {
        organizationId,
        userId,
        licenseId,
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
