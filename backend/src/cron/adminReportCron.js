import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";

const ADMIN_EMAIL = [
  "akshat.shah@aakrin.com",
  "krishna@aakrin.com",
];

// ─────────────────────────────────────────────────────────────────────────────
// HTML EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const getAdminStatsTemplate = ({ stats, date }) => {
  const { totalCandidates, totalCompanies, individualProfilesFilled, orgStats } = stats;

  const orgRows = orgStats
    .map(
      (org) => `
      <tr>
        <td style="padding:10px 14px; border-bottom:1px solid #f0f0f0;">${org.companyName || org.orgName}</td>
        <td style="padding:10px 14px; border-bottom:1px solid #f0f0f0; text-align:center;">${org.totalJobs}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px; font-weight:600; letter-spacing:0.5px;">
                📊 Daily Platform Stats
              </h1>
              <p style="color:#a0aec0; margin:8px 0 0; font-size:14px;">${date}</p>
            </td>
          </tr>

          <!-- Summary Cards -->
          <tr>
            <td style="padding: 32px 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Total Candidates -->
                  <td width="32%" style="background:#f0fdf4; border-radius:10px; padding:20px 16px; text-align:center;">
                    <div style="font-size:32px; font-weight:700; color:#16a34a;">${totalCandidates}</div>
                    <div style="font-size:12px; color:#6b7280; margin-top:6px; font-weight:500;">Total Candidates</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Total Companies -->
                  <td width="32%" style="background:#eff6ff; border-radius:10px; padding:20px 16px; text-align:center;">
                    <div style="font-size:32px; font-weight:700; color:#2563eb;">${totalCompanies}</div>
                    <div style="font-size:12px; color:#6b7280; margin-top:6px; font-weight:500;">Total Companies</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Profiles Filled -->
                  <td width="32%" style="background:#fefce8; border-radius:10px; padding:20px 16px; text-align:center;">
                    <div style="font-size:32px; font-weight:700; color:#ca8a04;">${individualProfilesFilled}</div>
                    <div style="font-size:12px; color:#6b7280; margin-top:6px; font-weight:500;">Individual Profiles Filled</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Org Jobs Table -->
          <tr>
            <td style="padding: 16px 40px 32px;">
              <h2 style="font-size:15px; font-weight:600; color:#1f2937; margin:0 0 14px;">
                🏢 Jobs by Organization
              </h2>
              ${
                orgStats.length === 0
                  ? `<p style="color:#6b7280; font-size:14px;">No organizations with active jobs found.</p>`
                  : `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; font-size:14px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 14px; text-align:left; color:#374151; font-weight:600; border-bottom:1px solid #e5e7eb;">Company Name</th>
                    <th style="padding:10px 14px; text-align:center; color:#374151; font-weight:600; border-bottom:1px solid #e5e7eb;">Total Jobs</th>
                  </tr>
                </thead>
                <tbody>
                  ${orgRows}
                </tbody>
              </table>`
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #f0f0f0;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                This is an automated daily report. Do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE STATS FETCHER
// ─────────────────────────────────────────────────────────────────────────────
const fetchPlatformStats = async () => {
  // 1. Total candidates (users with role = 'candidate')
  const totalCandidates = await prisma.users.count({
    where: { role: "candidate" },
  });

  // 2. Total companies (users with role = 'company')
  const totalCompanies = await prisma.users.count({
    where: { role: "company" },
  });

  // 3. Individual profiles filled — UserProfile where vendorId IS NULL
  //    (equivalent to: SELECT count(*) FROM "UserProfile" WHERE "vendorId" IS NULL)
  const individualProfilesFilled = await prisma.userProfile.count({
    where: { vendorId: null },
  });

  // 4. Per-organization: company name + total jobs
  //    Group jobs by organizationId, join with CompanyProfile for name
  const jobsByOrg = await prisma.job.groupBy({
    by: ["organizationId"],
    where: {
      isDeleted: false,
      organizationId: { not: null },
    },
    _count: { id: true },
  });

  // Fetch org names in one query
  const orgIds = jobsByOrg.map((j) => j.organizationId).filter(Boolean);

  const organizations = await prisma.organization.findMany({
    where: { id: { in: orgIds } },
    select: {
      id: true,
      name: true,
      companyProfile: { select: { name: true } },
    },
  });

  const orgMap = Object.fromEntries(organizations.map((o) => [o.id, o]));

  const orgStats = jobsByOrg.map((item) => {
    const org = orgMap[item.organizationId];
    return {
      orgName: org?.name ?? "Unknown",
      companyName: org?.companyProfile?.name ?? org?.name ?? "Unknown",
      totalJobs: item._count.id,
    };
  });

  // Sort by most jobs first
  orgStats.sort((a, b) => b.totalJobs - a.totalJobs);

  return { totalCandidates, totalCompanies, individualProfilesFilled, orgStats };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CRON HANDLER
// ─────────────────────────────────────────────────────────────────────────────
const runAdminStatsNotification = async () => {
  console.log("📊 Admin stats cron: STARTED");
  try {
    const stats = await fetchPlatformStats();
    const date = dayjs().format("dddd, D MMMM YYYY");

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `📊 Daily Platform Report — ${dayjs().format("D MMM YYYY")}`,
      html: getAdminStatsTemplate({ stats, date }),
    });

    console.log(
      `📊 Admin stats cron DONE: email sent to ${ADMIN_EMAIL} | ` +
        `candidates=${stats.totalCandidates}, companies=${stats.totalCompanies}, ` +
        `individualProfiles=${stats.individualProfilesFilled}, orgs=${stats.orgStats.length}`
    );
  } catch (err) {
    console.error("💥 Admin stats cron error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULER — every day at 9 AM IST
// ─────────────────────────────────────────────────────────────────────────────
export const startAdminStatsCron = () => {
  cron.schedule("0 9 * * *", runAdminStatsNotification, {
    timezone: "Asia/Kolkata",
  });
//   //TESTING
//   cron.schedule("30 17 * * *", runAdminStatsNotification, {
//     timezone: "Asia/Kolkata",
//   });

  console.log("🕒 Admin stats cron registered: daily 9 AM IST → shruthi.danamma@aakrin.com");
};