import { baseTemplate } from "./BaseTemplate.js";

// ── License expiry / renewal reminder (licenseReminderCron) ───────────────────
export const getRenewalReminderEmailTemplate = ({ name, orgName, expiryDate, licenseCount, daysText, renewUrl }) =>
  baseTemplate({
    title: "⏰ License Renewal Reminder",
    body: `
      <p style="font-size:16px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:14px; line-height:1.6;">
        Your <strong>${licenseCount} license${licenseCount > 1 ? "s" : ""}</strong>
        for <strong>${orgName}</strong> ${daysText}.
      </p>
      <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:20px; margin:20px 0; text-align:center;">
        <p style="margin:0 0 6px; font-size:13px; color:#92400e; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Expiry Date</p>
        <p style="margin:0; font-size:22px; font-weight:700; color:#c2410c;">${expiryDate}</p>
      </div>
      <div style="text-align:center; margin:30px 0;">
        <a href="${renewUrl}"
           style="display:inline-block; padding:13px 32px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; text-decoration:none; font-weight:700; border-radius:8px; font-size:14px;">
          Renew Now →
        </a>
      </div>
      <p style="font-size:13px; color:#6b7280; line-height:1.6;">
        Renewing your license ensures uninterrupted access to all ForceHead features for your team.
      </p>
    `,
  });
