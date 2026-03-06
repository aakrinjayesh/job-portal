import sendEmail from "../sendEmail.js";

export const queueJobEmails = async ({
  recruiterEmails = [],
  candidateEmails = [],
  job,
}) => {
  const jobUrl = `${process.env.FRONTEND_URL}/job/${job.id}`;

  //   const emailHtml = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <meta charset="UTF-8" />
  // </head>
  // <body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
  //   <table width="100%" cellpadding="0" cellspacing="0">
  //     <tr>
  //       <td align="center" style="padding:30px 0;">
  //         <table width="520" cellpadding="0" cellspacing="0"
  //           style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

  //           <tr>
  //             <td style="background:#1677ff; color:#ffffff; padding:20px; text-align:center;">
  //               <h2 style="margin:0;">New Job Opportunity</h2>
  //             </td>
  //           </tr>

  //           <tr>
  //             <td style="padding:24px; color:#333;">
  //               <h3 style="margin-top:0;">${job.role}</h3>

  //               <p style="font-size:14px; line-height:1.6; color:#555;">
  //                 ${job.description}
  //               </p>

  //               <div style="text-align:center; margin:30px 0;">
  //                 <a
  //                   href="${jobUrl}"
  //                   target="_blank"
  //                   style="
  //                     background:#1677ff;
  //                     color:#ffffff;
  //                     padding:12px 24px;
  //                     text-decoration:none;
  //                     border-radius:6px;
  //                     font-size:14px;
  //                     font-weight:600;
  //                     display:inline-block;
  //                   "
  //                 >
  //                   View Job Details
  //                 </a>
  //               </div>

  //               <p style="font-size:13px; color:#6b7280;">
  //                 A new job has been posted on ForceHead.
  //               </p>
  //             </td>
  //           </tr>

  //           <tr>
  //             <td style="background:#f9fafb; padding:12px; text-align:center; font-size:12px; color:#9ca3af;">
  //               © ${new Date().getFullYear()} ForceHead
  //             </td>
  //           </tr>

  //         </table>
  //       </td>
  //     </tr>
  //   </table>
  // </body>
  // </html>
  // `;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 0;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:#1677ff; color:#ffffff; padding:24px; text-align:center;">
              <h2 style="margin:0;">🚀 New Job Opportunity</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px; color:#333;">

              <h3 style="margin-top:0;">${job.role}</h3>

              <div style="background:#f9fafb; padding:18px; border-radius:8px; margin-bottom:20px;">

                <p><strong>Company:</strong> ${job.companyName || "Not specified"}</p>
                <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
                <p><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
                <p>
  <strong>Experience Required:</strong> 
  ${
    job.experience?.min && job.experience?.max
      ? `${job.experience.min}-${job.experience.max} ${job.experience.type}`
      : job.experience?.number
        ? `${job.experience.number} ${job.experience.type}`
        : "Not Specified"
  }
</p>

                <p><strong>Salary:</strong> ${job.salary || "Not disclosed"}</p>

               ${
                 Array.isArray(job.skills) && job.skills.length
                   ? `<p><strong>Required Skills:</strong> ${job.skills.join(", ")}</p>`
                   : ""
               }

               ${
                 Array.isArray(job.clouds) && job.clouds.length
                   ? `<p><strong>Cloud Expertise:</strong> ${job.clouds.join(", ")}</p>`
                   : ""
               }

               

              </div>

             ${
               job.description
                 ? `
  <div style="margin-bottom:20px;">
    <h4>Description</h4>
    <p style="font-size:14px; line-height:1.6; color:#555;">
      ${job.description}
    </p>
  </div>
`
                 : ""
             }

            ${
              Array.isArray(job.responsibilities) && job.responsibilities.length
                ? `
    <ul>
      ${job.responsibilities.map((r) => `<li>${r}</li>`).join("")}
    </ul>
  `
                : ""
            }

              <div style="text-align:center; margin:30px 0;">
                <a
                  href="${jobUrl}"
                  target="_blank"
                  style="
                    background:#1677ff;
                    color:#ffffff;
                    padding:14px 28px;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:14px;
                    font-weight:600;
                    display:inline-block;
                  "
                >
                  View Full Job Details
                </a>
              </div>

              <p style="font-size:13px; color:#6b7280;">
                A new job has been posted on ForceHead.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:14px; text-align:center; font-size:12px; color:#9ca3af;">
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

  // 🔹 Send individually to recruiters
  for (const email of recruiterEmails) {
    await sendEmail({
      to: email,
      subject: `New Job Posted: ${job.role}`,
      html: emailHtml,
    });
  }

  // 🔹 Send individually to candidates
  for (const email of candidateEmails) {
    await sendEmail({
      to: email,
      subject: `New Job Opportunity: ${job.role}`,
      html: emailHtml,
    });
  }
};
