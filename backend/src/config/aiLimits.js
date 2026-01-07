export const AI_LIMITS = {
  FREE: {
    max: 5,          // 5 AI calls
    windowMs: 24 * 60 * 60 * 1000 // per day
  },
  PAID: {
    max: 100,        // 100 AI calls
    windowMs: 24 * 60 * 60 * 1000
  }
};
