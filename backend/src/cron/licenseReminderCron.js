import cron from "node-cron";
import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import { getRenewalReminderEmailTemplate } from "../utils/emailTemplates/LicenseTemplates.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20;
let isRunning = false;

// ─────────────────────────────────────────────────────────────────────────────
// CORE JOB
// ─────────────────────────────────────────────────────────────────────────────

const runLicenseReminderJob = async () => {
  if (isRunning) {
    console.log("⚠️ Previous cron still running — skipping this run");
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  console.log("🚀 License reminder cron: STARTED");

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const getSubscriptions = async (retry = 2) => {
      try {
        return await prisma.organizationSubscription.findMany({
          where: {
            status: "ACTIVE",
            licenses: {
              some: {
                isActive: true,
                // validUntil: {
                //   gte: threeDaysAgo,
                //   lte: sevenDaysFromNow,
                // },
                validUntil: {
                  lt: new Date(), // ✅ only expired
                },
              },
            },
          },
          select: {
            organizationId: true,
            organization: {
              select: {
                name: true,
                members: {
                  where: { role: "COMPANY_ADMIN" },
                  orderBy: { createdAt: "asc" }, // ✅ FIX
                  take: 1,
                  select: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            licenses: {
              where: {
                isActive: true,
                // validUntil: {
                //   gte: threeDaysAgo,
                //   lte: sevenDaysFromNow,
                // },
                validUntil: {
                  lt: new Date(), // ✅ only expired
                },
              },
              orderBy: { validUntil: "asc" },
              select: {
                validUntil: true,
              },
            },
          },
        });
      } catch (error) {
        if (error.code === "P1017") {
          console.log("🔌 Reconnecting Prisma...");
          await prisma.$disconnect();
          await prisma.$connect();
        }
        if (retry > 0) {
          console.log("🔁 Retrying DB query...");
          return getSubscriptions(retry - 1);
        }
        throw err;
      }
    };

    const subscriptions = await getSubscriptions();

    console.log(`📦 Found ${subscriptions.length} subscriptions`);

    subscriptions.forEach((sub) => {
      const admin = sub.organization.members?.[0];

      if (!admin?.user?.email) {
        console.log(`❌ No admin for org ${sub.organizationId}`);
        return;
      }

      console.log(`✅ ${sub.organization.name} → ${admin.user.email}`);
    });

    let emailsSent = 0;

    // ─────────────────────────────────────────────────────────
    // 🔥 BATCH PROCESSING (parallel inside batch)
    // ─────────────────────────────────────────────────────────
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (subscription) => {
          try {
            const admin = subscription.organization.members?.[0];

            if (!admin?.user?.email) {
              console.log(
                `No admin found for org ${subscription.organizationId}`,
              );
              return;
            }

            const earliestExpiry = subscription.licenses[0]?.validUntil;
            if (!earliestExpiry) return;

            const licenseCount = subscription.licenses.length;

            const diffMs = earliestExpiry.getTime() - Date.now();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let daysText;
            if (diffDays > 0) {
              daysText = `will expire in <strong>${diffDays} day${
                diffDays === 1 ? "" : "s"
              }</strong>`;
            } else if (diffDays === 0) {
              daysText = `expire <strong>today</strong>`;
            } else {
              daysText = `expired <strong>${Math.abs(diffDays)} day${
                Math.abs(diffDays) === 1 ? "" : "s"
              } ago</strong>`;
            }

            const subject =
              diffDays > 0
                ? `Reminder: Licenses expire in ${diffDays} day${
                    diffDays === 1 ? "" : "s"
                  }`
                : `Action Required: Licenses expired`;

            await sendEmail({
              to: admin.user.email,
              subject,
              html: getRenewalReminderEmailTemplate({
                name: admin.user.name || "Admin",
                orgName: subscription.organization.name,
                expiryDate: earliestExpiry.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                licenseCount,
                daysText,
                renewUrl: `${FRONTEND_URL}/company/renew`,
                isExpired: diffDays <= 0,
              }),
            });

            emailsSent++;
          } catch (err) {
            console.error(
              `❌ Failed for org ${subscription.organizationId}: ${err.message}`,
            );
          }
        }),
      );

      console.log(`✅ Processed batch ${i / BATCH_SIZE + 1}`);
    }

    console.log(`🎯 DONE: ${emailsSent}/${subscriptions.length} emails sent`);
  } catch (error) {
    console.error("💥 Cron job error:", error);
  } finally {
    const duration = Date.now() - startTime;
    console.log(`⏱ Execution time: ${duration} ms`);

    isRunning = false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────

export const startLicenseReminderCron = () => {
  // 9:00 AM IST
  cron.schedule("0 9 * * *", runLicenseReminderJob, {
    timezone: "Asia/Kolkata",
  });

  // 9:00 PM IST
  cron.schedule("0 21 * * *", runLicenseReminderJob, {
    timezone: "Asia/Kolkata",
  });
  // TESTING
  // cron.schedule("35 13 * * *", runLicenseReminderJob, {
  //   timezone: "Asia/Kolkata",
  // });

  console.log("🕒 Cron registered: 9 AM & 9 PM IST");
};
