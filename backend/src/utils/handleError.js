import sendEmail from "../utils/sendEmail.js";
import prisma from "../config/prisma.js";

const sendErrorEmail = async ({
  message,
  stack,
  route,
  method,
  body,
  user,
  userOrgId,
  timestamp,
}) => {
  const userSection = user
    ? `
      <tr><td class="label">User ID</td><td><code>${user.id}</code></td></tr>
      <tr><td class="label">Name</td><td>${user.name || "—"}</td></tr>
      <tr><td class="label">Email</td><td><a href="mailto:${user.email}">${user.email || "—"}</a></td></tr>
      <tr><td class="label">Role</td><td>${user.role || "—"}</td></tr>
      <tr><td class="label">Org ID</td><td>${userOrgId || "—"}</td></tr>
    `
    : `<tr><td class="label">User</td><td><em>Unauthenticated</em></td></tr>`;

  const safeBody = (() => {
    try {
      const cleaned = { ...body };
      delete cleaned.password;
      delete cleaned.token;
      return JSON.stringify(cleaned, null, 2);
    } catch {
      return String(body);
    }
  })();

  await sendEmail({
    to: process.env.EMAIL_LLM,
    subject: `🔥 [ForceHead ERROR] ${method} ${route}`,
    cc: ["akshat.shah@aakrin.com"],
    text: "Error info",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; color: #333; }
          .card { background: #fff; border-radius: 8px; padding: 24px; max-width: 700px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h2 { color: #c0392b; margin-top: 0; border-bottom: 2px solid #c0392b; padding-bottom: 10px; }
          h3 { color: #555; margin: 20px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          td { padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; vertical-align: top; }
          td.label { background: #f9f9f9; font-weight: bold; width: 130px; color: #555; }
          pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
          .badge { display: inline-block; background: #c0392b; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          a { color: #2980b9; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🔥 Server Error Report</h2>

          <h3>📋 Error Details</h3>
          <table>
            <tr><td class="label">Timestamp</td><td>${timestamp}</td></tr>
            <tr><td class="label">Status</td><td><span class="badge">500 Internal Server Error</span></td></tr>
            <tr><td class="label">Message</td><td><strong>${message}</strong></td></tr>
            <tr><td class="label">Method</td><td><code>${method}</code></td></tr>
            <tr><td class="label">Route</td><td><code>${route}</code></td></tr>
          </table>

          <h3>👤 User Details</h3>
          <table>
            ${userSection}
          </table>

          <h3>📦 Request Body</h3>
          <pre>${safeBody || "— empty —"}</pre>

          <h3>🧵 Stack Trace</h3>
          <pre>${stack || "No stack trace available"}</pre>

          <div class="footer">ForceHead Error Monitoring • ${timestamp}</div>
        </div>
      </body>
      </html>
    `,
  });
};

export const handleError = async (err, req, res) => {
  console.error("🔥 GLOBAL ERROR:", err);

  if (
    err instanceof TypeError &&
    err.message?.includes("Cannot destructure property") &&
    err.message?.includes("req.user")
  ) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    try {
      let fullUser = null;
      if (req?.user?.id) {
        try {
          fullUser = await prisma.users.findUnique({
            where: { id: req.user.id },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });
        } catch (dbErr) {
          console.error("Failed to fetch user for error email:", dbErr.message);
        }
      }

      await sendErrorEmail({
        message: err.message,
        stack: err.stack,
        route: req?.originalUrl || "— no req —",
        method: req?.method || "— no req —",
        body: req?.body || "— no req —",
        user: fullUser ?? null,
        userOrgId: req?.user?.organizationId || null,
        timestamp: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr);
    }
  }
};
