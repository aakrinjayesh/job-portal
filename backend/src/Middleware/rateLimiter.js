import rateLimit from "express-rate-limit";



// General API limiter (most routes)

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                // 300 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please try again later1."
  }
});


// Auth / Login limiter (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // only 10 login attempts per 15 min
  message: {
    status: "error",
    message: "Too many login attempts. Try again later2."
  }
});


// AI-heavy routes limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI calls per hour
  message: {
    status: "error",
    message: "AI usage limit reached. Upgrade your plan."
  }
});
