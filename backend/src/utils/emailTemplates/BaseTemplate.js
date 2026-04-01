/**
 * Base email template — shared header + footer used by all email templates.
 * Header style matches getWelcomePasswordEmailTemplate (blue gradient #1e3a8a → #2563eb).
 *
 * @param {string} title        - Header title text
 * @param {string} [subtitle]   - Optional subtitle below the title
 * @param {string} body         - Inner HTML content for the email body
 */
export const baseTemplate = ({ title, subtitle = "AI Powered Salesforce B2B Network", body }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; padding:30px; text-align:center;">
              <h1 style="margin:0; font-size:22px;">${title}</h1>
              ${subtitle ? `<p style="margin:8px 0 0; font-size:14px; opacity:0.9;">${subtitle}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ForceHead. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
