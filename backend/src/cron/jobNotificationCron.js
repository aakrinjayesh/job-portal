import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import {
  getDailyJobsTemplate,
  getWeeklyJobsTemplate,
} from "../utils/emailTemplates/JobTemplates.js";

const BATCH_SIZE = 20;

const sendJobEmails = async ({ jobs, users, getTemplate, label }) => {
  if (!jobs.length || !users.length) return 0;

  let sent = 0;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (user) => {
        try {
          await sendEmail({
            to: user.email,
            subject:
              label === "DAILY"
                ? `🚀 ${jobs.length} New Job${jobs.length === 1 ? "" : "s"} Today`
                : `🔥 Weekly Job Digest (${jobs.length} job${jobs.length === 1 ? "" : "s"})`,
            html: getTemplate({ jobs }),
          });
          sent++;
          await new Promise((r) => setTimeout(r, 100)); // avoid rate limits
        } catch (err) {
          console.error(
            `❌ Failed to send ${label} email to ${user.email}:`,
            err.message,
          );
        }
      }),
    );
  }
  return sent;
};

// ─────────────────────────────────────────────────────────────────────────────
// DAILY — runs every day at 9 AM IST, sends jobs posted yesterday
// ─────────────────────────────────────────────────────────────────────────────
const runDailyJobNotifications = async () => {
  console.log("📅 Daily job notification cron: STARTED");
  try {
    const start = dayjs().subtract(1, "day").startOf("day").toDate();
    const end = dayjs().subtract(1, "day").endOf("day").toDate();

    const jobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        isDeleted: false,
        status: "Open",
      },
      select: {
        id: true,
        role: true,
        companyName: true,
        location: true,
        salary: true,
      },
    });

    if (!jobs.length) {
      console.log("📅 Daily cron: no jobs posted yesterday — skipping");
      return;
    }

    const users = await prisma.users.findMany({
      where: { notificationsEnabled: true, notificationType: "DAILY" },
      select: { email: true },
    });

    const sent = await sendJobEmails({
      jobs,
      users,
      getTemplate: getDailyJobsTemplate,
      label: "DAILY",
    });
    console.log(
      `📅 Daily cron DONE: ${sent}/${users.length} emails sent for ${jobs.length} jobs`,
    );
  } catch (err) {
    console.error("💥 Daily job cron error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY — runs every Friday at 9 AM IST, sends jobs from last 7 days
// ─────────────────────────────────────────────────────────────────────────────
const runWeeklyJobNotifications = async () => {
  console.log("📆 Weekly job notification cron: STARTED");
  try {
    const start = dayjs().subtract(7, "day").startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const jobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        isDeleted: false,
        status: "Open",
      },
      select: {
        id: true,
        role: true,
        companyName: true,
        location: true,
        salary: true,
      },
    });

    if (!jobs.length) {
      console.log("📆 Weekly cron: no jobs this week — skipping");
      return;
    }

    const users = await prisma.users.findMany({
      where: { notificationsEnabled: true, notificationType: "WEEKLY" },
      select: { email: true },
    });

    const sent = await sendJobEmails({
      jobs,
      users,
      getTemplate: getWeeklyJobsTemplate,
      label: "WEEKLY",
    });
    console.log(
      `📆 Weekly cron DONE: ${sent}/${users.length} emails sent for ${jobs.length} jobs`,
    );
  } catch (err) {
    console.error("💥 Weekly job cron error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────
export const startJobNotificationCron = () => {
  // Daily at 10 AM IST
  cron.schedule("0 10 * * *", runDailyJobNotifications, {
    timezone: "Asia/Kolkata",
  });

  // Weekly every Friday at 10 AM IST
  cron.schedule("0 10 * * 5", runWeeklyJobNotifications, {
    timezone: "Asia/Kolkata",
  });

  console.log(
    "🕒 Job notification crons registered: daily 10 AM & weekly Friday 10 AM IST",
  );
};
