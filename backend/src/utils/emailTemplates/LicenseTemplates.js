import { baseTemplate } from "./BaseTemplate.js";

// ── License expiry / renewal reminder (licenseReminderCron) ───────────────────
export const getRenewalReminderEmailTemplate = ({ name, orgName, expiryDate, licenseCount, daysText, renewUrl, isExpired }) =>
  baseTemplate({
    title: isExpired ? "⚠️ License Expired — Action Required" : "⏰ License Renewal Reminder",
    subtitle: isExpired
      ? "Your team has lost access to paid features"
      : "Renew before expiry to avoid interruption",
    body: `
      <p style="font-size:15px; color:#1e293b; margin:0 0 6px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 24px;">
        The <strong style="color:#1e293b;">${licenseCount} license${licenseCount > 1 ? "s" : ""}</strong>
        for <strong style="color:#1e293b;">${orgName}</strong> ${daysText}.
        ${isExpired
          ? "Your team members have lost access to paid features and will be limited to the free tier until renewed."
          : "Renew now to ensure your team keeps uninterrupted access to all ForceHead features."
        }
      </p>

      <!-- Urgency banner -->
      <div style="background:${isExpired ? "#fef2f2" : "#fff7ed"}; border:1.5px solid ${isExpired ? "#fca5a5" : "#fed7aa"}; border-radius:10px; padding:20px; margin:0 0 24px; text-align:center;">
        <p style="margin:0 0 4px; font-size:12px; font-weight:700; color:${isExpired ? "#991b1b" : "#92400e"}; text-transform:uppercase; letter-spacing:0.8px;">
          ${isExpired ? "Expired On" : "Expiry Date"}
        </p>
        <p style="margin:0 0 4px; font-size:26px; font-weight:700; color:${isExpired ? "#dc2626" : "#c2410c"};">${expiryDate}</p>
        <p style="margin:0; font-size:13px; color:${isExpired ? "#b91c1c" : "#9a3412"};">${daysText}</p>
      </div>

      <!-- Summary table -->
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin:0 0 24px;">
        <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.8px;">Renewal Summary</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:7px 0; font-size:13px; color:#64748b; width:55%;">Organization</td>
            <td style="padding:7px 0; font-size:13px; color:#1e293b; font-weight:600; text-align:right;">${orgName}</td>
          </tr>
          <tr><td colspan="2"><div style="border-top:1px solid #e2e8f0; margin:2px 0;"></div></td></tr>
          <tr>
            <td style="padding:7px 0; font-size:13px; color:#64748b;">Licenses Affected</td>
            <td style="padding:7px 0; font-size:13px; color:#1e293b; font-weight:600; text-align:right;">${licenseCount} seat${licenseCount > 1 ? "s" : ""}</td>
          </tr>
          <tr><td colspan="2"><div style="border-top:1px solid #e2e8f0; margin:2px 0;"></div></td></tr>
          <tr>
            <td style="padding:7px 0; font-size:13px; color:#64748b;">Status</td>
            <td style="padding:7px 0; font-size:13px; font-weight:700; text-align:right; color:${isExpired ? "#dc2626" : "#d97706"};">
              ${isExpired ? "Expired" : "Expiring Soon"}
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center; margin:0 0 24px;">
        <a href="${renewUrl}"
           style="display:inline-block; padding:14px 40px; background:${isExpired ? "linear-gradient(135deg,#991b1b,#dc2626)" : "linear-gradient(135deg,#1e3a8a,#2563eb)"}; color:#ffffff; text-decoration:none; font-weight:700; border-radius:8px; font-size:15px; letter-spacing:0.3px;">
          ${isExpired ? "Restore Access Now →" : "Renew Now →"}
        </a>
        <p style="margin:10px 0 0; font-size:12px; color:#94a3b8;">You will be taken to the ForceHead renewal page</p>
      </div>

      <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.6; border-top:1px solid #f1f5f9; padding-top:16px;">
        If you believe this is a mistake or need help with your subscription, please contact our support team.
        This email was sent to the organization admin of <strong>${orgName}</strong>.
      </p>
    `,
  });
