import sendEmail from "../sendEmail.js";
import { getNewJobEmailTemplate } from "../emailTemplates/JobTemplates.js";

export const queueJobEmails = async ({
  recruiterEmails = [],
  candidateEmails = [],
  job,
}) => {
  const jobUrl = `${process.env.FRONTEND_URL}/job/${job.id}`;


  // 🔹 Send individually to recruiters
  for (const email of recruiterEmails) {
    await sendEmail({
      to: email,
      subject: `New Job Posted: ${job.role}`,
      html: getNewJobEmailTemplate({ job, jobUrl }),
    });
  }

  // 🔹 Send individually to candidates
  for (const email of candidateEmails) {
    await sendEmail({
      to: email,
      subject: `New Job Opportunity: ${job.role}`,
      html: getNewJobEmailTemplate({ job, jobUrl }),
    });
  }
};
