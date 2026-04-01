import { baseTemplate } from "./BaseTemplate.js";

// ── Team member invite ────────────────────────────────────────────────────────
export const getInviteEmailTemplate = ({ acceptLink }) =>
  baseTemplate({
    title: "You're Invited to Join ForceHead 🚀",
    subtitle: "Salesforce B2B Hiring & Vendor Portal",
    body: `
      <h2 style="color:#1e3a8a; margin-top:0;">You're Invited to Join an Organization</h2>
      <p style="color:#555; font-size:15px; line-height:1.6;">
        You have been invited to join an organization on <strong>ForceHead</strong>.
        Click the button below to set your password and activate your account.
      </p>
      <div style="text-align:center; margin:30px 0;">
        <a href="${acceptLink}"
           style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:white; text-decoration:none; font-weight:bold; border-radius:8px; font-size:16px;">
          Accept Invitation
        </a>
      </div>
      <div style="background:#f8faff; border:1px solid #e0e7ff; padding:20px; border-radius:8px; margin-top:25px;">
        <p style="margin:0; font-size:14px; color:#666;">
          🔒 For security reasons, this link may expire.
          If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
      <p style="color:#666; font-size:13px; margin-top:30px;">
        If the button above does not work, copy and paste this link into your browser:
      </p>
      <p style="word-break:break-all; font-size:12px; color:#2563eb;">${acceptLink}</p>
    `,
  });
