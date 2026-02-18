import { email } from "zod";
import sendEmail from "../sendEmail.js";

export const queueRecruiterEmails = async (recruiters, job) => {

  console.log('emails',recruiters)
  const BATCH_SIZE = 50;

  for (let i = 0; i < recruiters.length; i += BATCH_SIZE) {
    const batch = recruiters.slice(i, i + BATCH_SIZE);

    await sendEmail({
      bcc: batch.map(r => r.email), // 🔐 privacy safe
      subject: `New Job Posted: ${job.role}`,
   html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 0;">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <tr>
            <td style="background:#1677ff; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">New Job Opportunity</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:24px; color:#333;">
              <h3 style="margin-top:0;">${job.role}</h3>

              <p style="font-size:14px; line-height:1.6; color:#555;">
                ${job.description}
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a
                  href="${process.env.FRONTEND_URL}/candidate/job/${job.id}"
                  target="_blank"
                  style="
                    background:#1677ff;
                    color:#ffffff;
                    padding:12px 24px;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:14px;
                    font-weight:600;
                    display:inline-block;
                  "
                >
                  View Job Details
                </a>
              </div>

              <p style="font-size:13px; color:#6b7280;">
                You are receiving this email because a new job matching your profile was posted.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb; padding:12px; text-align:center; font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} ForceHead
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
    });
  }
};
