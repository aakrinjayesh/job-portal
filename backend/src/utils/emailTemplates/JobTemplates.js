import { baseTemplate } from "./BaseTemplate.js";

// ── 1. Recruiter notified when a candidate applies ────────────────────────────
export const getNewApplicationRecruiterEmailTemplate = ({ job, user }) => {
  return baseTemplate({
    title: "New Job Application Received! 🎉",
    subtitle: `${job.role} at ${job.companyName}`,
    body: `
      <h2 style="color:#1e3a8a; margin-top:0;">Application Details</h2>
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-bottom:20px;">
        <p style="margin:10px 0;"><strong>Job Position:</strong> ${job.role}</p>
        <p style="margin:10px 0;"><strong>Company:</strong> ${job.companyName}</p>
        <p style="margin:10px 0;"><strong>Candidate Name:</strong> ${user.name}</p>
        <p style="margin:10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      ${
        user.CandidateProfile
          ? `
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-bottom:20px;">
        <h3 style="color:#1e3a8a; margin-top:0;">Quick Summary</h3>
        ${user.CandidateProfile.title ? `<p><strong>Current Role:</strong> ${user.CandidateProfile.title}</p>` : ""}
        ${user.CandidateProfile.totalExperience ? `<p><strong>Experience:</strong> ${user.CandidateProfile.totalExperience}</p>` : ""}
        ${user.CandidateProfile.currentLocation ? `<p><strong>Location:</strong> ${user.CandidateProfile.currentLocation}</p>` : ""}
        ${user.CandidateProfile.expectedCTC ? `<p><strong>Expected CTC:</strong> ₹${user.CandidateProfile.expectedCTC}</p>` : ""}
        ${user.CandidateProfile.joiningPeriod ? `<p><strong>Notice Period:</strong> ${user.CandidateProfile.joiningPeriod}</p>` : ""}
      </div>`
          : ""
      }
      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}/company/candidate/${user.id}"
           style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; text-decoration:none; font-weight:bold; border-radius:8px; font-size:15px; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
          👁️ View Full Application Details
        </a>
      </div>
      <div style="margin-top:25px; text-align:center;">
  <a
    href="${process.env.BACKEND_URL}/disable-notification/${job.id}"
    style="
      color:#dc2626;
      font-size:13px;
      text-decoration:none;
      font-weight:600;
    "
  >
    Disable notifications for this job
  </a>
</div>
      <p style="color:#666; font-size:14px; margin-top:20px;">📎 Please find the detailed resume attached to this email.</p>
    `,
  });
};

// ── 2. Candidate confirmation after applying ──────────────────────────────────
export const getApplicationConfirmationCandidateEmailTemplate = ({
  job,
  user,
}) =>
  baseTemplate({
    title: "Application Submitted Successfully! ✅",
    subtitle: `${job.role} at ${job.companyName}`,
    body: `
      <p style="font-size:16px;">Hi <strong>${user.name}</strong>,</p>
      <p style="color:#666;">Your application has been successfully submitted for the following position:</p>
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin:20px 0;">
        <p><strong>Position:</strong> ${job.role}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
        <p><strong>Employment Type:</strong> ${job.employmentType || "N/A"}</p>
        <p><strong>Experience Required:</strong> ${job.experience || "N/A"}</p>
        <p><strong>Experience Level:</strong> ${job.experienceLevel || "N/A"}</p>
        <p><strong>Salary:</strong> ${job.salary ? `₹${job.salary}` : "Not disclosed"}</p>
        <p><strong>Job Type:</strong> ${job.jobType || "N/A"}</p>
        <p><strong>Application Deadline:</strong> ${job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified"}</p>
        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      ${
        job.skills?.length
          ? `
      <div style="margin-bottom:20px;">
        <h3 style="color:#1e3a8a; margin-bottom:5px;">Required Skills</h3>
        <p style="color:#555;">${job.skills.join(", ")}</p>
      </div>`
          : ""
      }
      ${
        job.clouds?.length
          ? `
      <div style="margin-bottom:20px;">
        <h3 style="color:#1e3a8a; margin-bottom:5px;">Required Clouds</h3>
        <p style="color:#555;">${job.clouds.join(", ")}</p>
      </div>`
          : ""
      }
      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}/job/${job.id}"
           style="display:inline-block; padding:12px 26px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; text-decoration:none; font-weight:bold; border-radius:8px; font-size:14px;">
          🔎 View Job Details
        </a>
      </div>
      <p style="color:#666;">The employer will review your application and contact you if your profile matches their requirements.</p>
      <p style="color:#666; margin-top:20px;">Good luck! 🍀</p>
    `,
  });

// ── 3. Bulk job notification (new job posted → recruiters & candidates) ────────
export const getNewJobEmailTemplate = ({ job, jobUrl }) =>
  baseTemplate({
    title: "🚀 New Job Opportunity",
    body: `
      <h3 style="margin-top:0; color:#1e3a8a;">${job.role}</h3>
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:18px; margin-bottom:20px;">
        <p><strong>Company:</strong> ${job.companyName || "Not specified"}</p>
        <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
        <p><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
        <p><strong>Experience Required:</strong> ${
          job.experience?.min && job.experience?.max
            ? `${job.experience.min}-${job.experience.max} ${job.experience.type}`
            : job.experience?.number
              ? `${job.experience.number} ${job.experience.type}`
              : "Not Specified"
        }</p>
        <p><strong>Salary:</strong> ${job.salary || "Not disclosed"}</p>
        ${Array.isArray(job.skills) && job.skills.length ? `<p><strong>Required Skills:</strong> ${job.skills.join(", ")}</p>` : ""}
        ${Array.isArray(job.clouds) && job.clouds.length ? `<p><strong>Required Cloud:</strong> ${job.clouds.join(", ")}</p>` : ""}
      </div>
      ${
        job.description
          ? `
      <div style="margin-bottom:20px;">
        <h4>Description</h4>
        <p style="font-size:14px; line-height:1.6; color:#555;">${job.description}</p>
      </div>`
          : ""
      }
      <div style="text-align:center; margin:30px 0;">
        <a href="${jobUrl}" target="_blank"
           style="display:inline-block; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:8px; font-size:14px; font-weight:600;">
          View Full Job Details
        </a>
      </div>
      <p style="font-size:13px; color:#6b7280;">A new job has been posted on ForceHead.</p>
    `,
  });

// ── Daily job digest ──────────────────────────────────────────────────────────
export const getDailyJobsTemplate = ({ jobs }) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const jobCards = jobs
    .map(
      (job) => `
    <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:18px; margin-bottom:16px;">
      <h3 style="margin:0 0 8px; color:#1e3a8a; font-size:16px;">${job.role}</h3>
      ${job.companyName ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Company:</strong> ${job.companyName}</p>` : ""}
      ${job.location ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Location:</strong> ${job.location}</p>` : ""}
      ${job.salary ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Salary:</strong> ${job.salary}</p>` : ""}
      <a href="${FRONTEND_URL}/job/${job.id}" target="_blank"
         style="display:inline-block; margin-top:10px; padding:8px 18px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-size:13px; font-weight:600;">
        View Job
      </a>
    </div>`,
    )
    .join("");

  return baseTemplate({
    title: `🚀 ${jobs.length} New Job${jobs.length === 1 ? "" : "s"} Posted Today`,
    body: `
      <p style="color:#374151; margin-bottom:20px;">Here are the latest jobs posted on ForceHead today:</p>
      ${jobCards}
     
      <p style="font-size:12px; color:#9ca3af; margin-top:24px; text-align:center;">
        You're receiving this because you have daily job notifications enabled.<br/>
        Update your preferences in <a href="${FRONTEND_URL}/settings" style="color:#2563eb;">Unsubscribe</a>.
      </p>
    `,
  });
};

// ── Weekly job digest ─────────────────────────────────────────────────────────
export const getWeeklyJobsTemplate = ({ jobs }) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const jobCards = jobs
    .map(
      (job) => `
    <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:18px; margin-bottom:16px;">
      <h3 style="margin:0 0 8px; color:#1e3a8a; font-size:16px;">${job.role}</h3>
      ${job.companyName ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Company:</strong> ${job.companyName}</p>` : ""}
      ${job.location ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Location:</strong> ${job.location}</p>` : ""}
      ${job.salary ? `<p style="margin:4px 0; font-size:13px; color:#374151;"><strong>Salary:</strong> ${job.salary}</p>` : ""}
      <a href="${FRONTEND_URL}/job/${job.id}" target="_blank"
         style="display:inline-block; margin-top:10px; padding:8px 18px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-size:13px; font-weight:600;">
        View Job
      </a>
    </div>`,
    )
    .join("");

  return baseTemplate({
    title: `🔥 Weekly Job Digest — ${jobs.length} Job${jobs.length === 1 ? "" : "s"} This Week`,
    body: `
      <p style="color:#374151; margin-bottom:20px;">Here's your weekly roundup of new jobs posted on ForceHead:</p>
      ${jobCards}
     
      <p style="font-size:12px; color:#9ca3af; margin-top:24px; text-align:center;">
        You're receiving this because you have weekly job notifications enabled.<br/>
        Update your preferences in <a href="${FRONTEND_URL}/settings" style="color:#2563eb;">Unsubscribe</a>.
      </p>
    `,
  });
};
