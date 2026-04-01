import { baseTemplate } from "./BaseTemplate.js";

// ── Support form submitted → admin notification ───────────────────────────────
export const getSupportEmailTemplate = ({ name, email, phone, role, subject, message }) =>
  baseTemplate({
    title: "New Support Request",
    subtitle: `Subject: ${subject}`,
    body: `
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-bottom:20px;">
        <p style="margin:8px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin:8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin:8px 0;"><strong>Phone:</strong> ${phone}</p>
        <p style="margin:8px 0;"><strong>Role:</strong> ${role || "-"}</p>
        <p style="margin:8px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:20px;">
        <p style="margin:0 0 10px; font-weight:700; color:#1e3a8a;">Message:</p>
        <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">${message}</p>
      </div>
    `,
  });
