import { AI_LIMITS } from "../config/aiLimits.js";
import prisma from "../config/prisma.js";

export const aiUserLimiter = async (req, res, next) => {
  try {
    const user = req.user; // coming from auth middleware
    // if (!user) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const plan = user.plan || "FREE";
    const limits = AI_LIMITS[plan];

    const now = new Date();

    // 🔁 Reset window if expired
    if (!user.aiResetAt || now > user.aiResetAt) {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          aiUsedCount: 0,
          aiResetAt: new Date(now.getTime() + limits.windowMs)
        }
      });
      user.aiUsedCount = 0;
    }

    // 🚫 Limit exceeded
    if (user.aiUsedCount >= limits.max) {
      return res.status(429).json({
        status: "error",
        message:
          plan === "FREE"
            ? "Free AI limit reached. Upgrade to continue."
            : "AI usage limit reached."
      });
    }

    // ✅ Increment usage
    await prisma.users.update({
      where: { id: user.id },
      data: { aiUsedCount: { increment: 1 } }
    });

    next();
  } catch (error) {
    console.error("AI Rate Limit Error:", error);
    res.status(500).json({ message: "AI rate limit error" });
  }
};
