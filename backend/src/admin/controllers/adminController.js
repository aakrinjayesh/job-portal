import jwt from "jsonwebtoken";
import { ADMIN_EMAILS, ADMIN_PASSWORD } from "../config/adminConfig.js";
import prisma from "../../config/prisma.js"; // adjust path to your prisma client

const adminLogin = async (req, res) => {
  const { email: em, password } = req.body;

  if (!em || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  const email = em.toLowerCase().trim();

  // 1️⃣ Check if email is in allowed list
  const isAllowedEmail = ADMIN_EMAILS.includes(email);
  if (!isAllowedEmail) {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials",
    });
  }

  // 2️⃣ Check password
  const isMatch = password === ADMIN_PASSWORD;
  if (!isMatch) {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials",
    });
  }

  // 3️⃣ Sign JWT
  const token = jwt.sign(
    { email }, // payload — no role
    process.env.SECRETKEY, // secret
    { expiresIn: "8h" }, // options
  );

  return res.status(200).json({
    status: "success",
    message: "Admin logged in successfully",
    token,
    admin: { email },
  });
};

const getAdminStats = async (req, res) => {
  try {
    const [
      totalCandidates,
      totalCompanies,
      totalJobs,
      totalOrganizations,
      totalApplications,
      recentUsers,
    ] = await Promise.all([
      // Total candidates
      prisma.users.count({
        where: { role: "candidate" },
      }),

      // Total companies
      prisma.users.count({
        where: { role: "company" },
      }),

      // Total jobs
      prisma.job.count({
        where: { isDeleted: false },
      }),

      // Total organizations
      prisma.organization.count(),

      // Total applications
      prisma.jobApplication.count(),

      // Recent 5 users
      prisma.users.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailverified: true,
        },
      }),
    ]);

    return res.status(200).json({
      status: "success",
      stats: {
        totalCandidates,
        totalCompanies,
        totalJobs,
        totalOrganizations,
        totalApplications,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("getAdminStats error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export { adminLogin, getAdminStats };
