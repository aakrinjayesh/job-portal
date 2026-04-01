import { baseTemplate } from "./BaseTemplate.js";

// ── 1. Vendor confirmation after submitting candidates ────────────────────────
export const getVendorApplicationConfirmationEmailTemplate = ({ job, vendor, appliedCandidates }) =>
  baseTemplate({
    title: "Application Submitted Successfully! ✅",
    subtitle: `${job.role} at ${job.companyName}`,
    body: `
      <p style="font-size:16px;">Hi <strong>${vendor.name}</strong>,</p>
      <p style="color:#666;">Your applications have been successfully submitted for the following position:</p>
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin:20px 0;">
        <p style="margin:10px 0;"><strong>Position:</strong> ${job.role}</p>
        <p style="margin:10px 0;"><strong>Company:</strong> ${job.companyName}</p>
        <p style="margin:10px 0;"><strong>Location:</strong> ${job.location || "Not specified"}</p>
        <p style="margin:10px 0;"><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
        <p style="margin:10px 0;"><strong>Experience Required:</strong> ${job.experience || "Not specified"}</p>
        <p style="margin:10px 0;"><strong>Salary:</strong> ${job.salary || "Not disclosed"}</p>
        <p style="margin:10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <p style="margin:10px 0;"><strong>Total Candidates Submitted:</strong> ${appliedCandidates.length}</p>
        ${job.skills?.length ? `<p style="margin:10px 0;"><strong>Required Skills:</strong> ${job.skills.join(", ")}</p>` : ""}
        ${job.clouds?.length ? `<p style="margin:10px 0;"><strong>Required Clouds:</strong> ${job.clouds.join(", ")}</p>` : ""}
        <hr style="margin:15px 0; border:none; border-top:1px solid #e0e7ff;" />
        <p style="margin:10px 0 8px 0; font-size:15px; font-weight:800; color:#111;">Submitted Candidates:</p>
        ${appliedCandidates.map((c) => `<p style="margin:5px 0; color:#333; font-size:14px;">• ${c.candidateName}</p>`).join("")}
      </div>
      <p style="color:#666;">The employer will review the applications and get back to you if profiles match their requirements.</p>
      <p style="color:#666; margin-top:20px;">Good luck! 🍀</p>
    `,
  });

// ── 2. Recruiter notified when vendor submits candidates ──────────────────────
export const getVendorApplicationRecruiterEmailTemplate = ({ job, processedCandidates, aiAllowed }) =>
  baseTemplate({
    title: "New Applications Received 🎉",
    subtitle: `${job.role} at ${job.companyName}`,
    body: `
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-bottom:20px;">
        <p><strong>Position:</strong> ${job.role}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
        <p><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
        <p><strong>Experience Level:</strong> ${job.experienceLevel || "Not specified"}</p>
        <p><strong>Job Type:</strong> ${job.jobType || "Not specified"}</p>
        <p><strong>Salary:</strong> ${job.salary ? `₹ ${job.salary}` : "Not disclosed"}</p>
        <p><strong>Application Deadline:</strong> ${job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified"}</p>
        <p><strong>Total Candidates Submitted:</strong> ${processedCandidates.length}</p>
        <p><strong>AI Ranking:</strong> ${aiAllowed ? "Enabled" : "Disabled"}</p>
      </div>
      ${job.skills?.length ? `
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:15px; margin-bottom:15px;">
        <h3 style="color:#1e3a8a; margin-top:0;">Required Skills</h3>
        <p style="color:#555;">${job.skills.join(", ")}</p>
      </div>` : ""}
      ${job.clouds?.length ? `
      <div style="background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:15px; margin-bottom:15px;">
        <h3 style="color:#1e3a8a; margin-top:0;">Required Clouds</h3>
        <p style="color:#555;">${job.clouds.join(", ")}</p>
      </div>` : ""}
      <div style="background:#ffffff; border:1px solid #e0e7ff; border-radius:10px; padding:20px; margin-top:20px;">
        <h3 style="color:#1e3a8a; margin-top:0;">Submitted Candidates</h3>
        ${processedCandidates.map((c) => `
        <div style="margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid #eee;">
          <div style="font-size:16px; margin-bottom:6px;"><strong>${c.candidateName}</strong></div>
          <a href="${process.env.FRONTEND_URL}/company/candidate/${c.profile.id}"
             style="display:inline-block; padding:8px 14px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px;">
            View Full Candidate Details
          </a>
        </div>`).join("")}
      </div>
      <p style="color:#666; font-size:14px; margin-top:25px;">Click on any candidate to view complete profile details including experience, certifications, work history and skills.</p>
    `,
  });
