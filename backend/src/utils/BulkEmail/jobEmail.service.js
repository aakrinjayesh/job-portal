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
        <h3>${job.role}</h3>
        <p>${job.description}</p>
        <a href="#">
          View Job
        </a>
      `,
    });
  }
};
