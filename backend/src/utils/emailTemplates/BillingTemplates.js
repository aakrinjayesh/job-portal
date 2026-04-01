import { baseTemplate } from "./BaseTemplate.js";

// ── Plan upgrade / payment success ────────────────────────────────────────────
export const getPlanUpgradeEmailTemplate = ({ name, plan, billing, limits, validUntil }) =>
  baseTemplate({
    title: "Plan Upgraded Successfully! 🚀",
    body: `
      <p style="font-size:15px; color:#1e293b; margin:0 0 6px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 24px;">
        Great news! Your ForceHead account has been upgraded to the
        <strong style="color:#2563eb;">${plan}</strong> plan. Your new features and limits are now active.
      </p>
      <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; border:1.5px solid #bfdbfe; border-radius:100px; padding:10px 28px; font-size:16px; font-weight:700; letter-spacing:0.5px;">
          ${plan} Plan · ${billing}
        </span>
      </div>
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-bottom:20px;">
        <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.8px;">Plan Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0; font-size:13px; color:#64748b; width:50%;">Valid Until</td>
            <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600; text-align:right;">${validUntil}</td>
          </tr>
          <tr><td colspan="2"><div style="border-top:1px solid #e2e8f0; margin:4px 0;"></div></td></tr>
          <tr>
            <td style="padding:6px 0; font-size:13px; color:#64748b;">Billing Cycle</td>
            <td style="padding:6px 0; font-size:13px; color:#1e293b; font-weight:600; text-align:right;">${billing}</td>
          </tr>
        </table>
      </div>
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:24px;">
        <div style="background:#1e3a8a; padding:12px 16px;">
          <p style="margin:0; font-size:13px; font-weight:700; color:#ffffff; text-transform:uppercase; letter-spacing:0.8px;">🎯 Your Plan Limits</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr style="background:#f1f5f9;">
            <td style="padding:10px 16px; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Feature</td>
            <td style="padding:10px 16px; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; text-align:center;">Period</td>
            <td style="padding:10px 16px; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; text-align:right;">Limit</td>
          </tr>
          ${limits.map((l, i) => `
          <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
            <td style="padding:11px 16px; font-size:13px; color:#1e293b; font-weight:500;">${l.feature.replace(/_/g, " ")}</td>
            <td style="padding:11px 16px; font-size:12px; color:#64748b; text-align:center;">${l.period}</td>
            <td style="padding:11px 16px; font-size:13px; color:#2563eb; font-weight:700; text-align:right;">${l.maxAllowed === 999999 ? "Unlimited" : l.maxAllowed}</td>
          </tr>`).join("")}
        </table>
      </div>
      <p style="font-size:13px; color:#64748b; margin:0 0 24px; line-height:1.6;">
        You can now enjoy your upgraded features. Log in to your dashboard to explore everything your new plan has to offer.
      </p>
      <div style="text-align:center; margin-bottom:24px;">
        <a href="${process.env.FRONTEND_URL}/company/jobs"
           style="display:inline-block; padding:13px 32px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; text-decoration:none; font-weight:700; border-radius:8px; font-size:14px;">
          Go to Dashboard →
        </a>
      </div>
      <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.6;">
        If you did not make this purchase or have any concerns, please contact our support immediately.
      </p>
    `,
  });
