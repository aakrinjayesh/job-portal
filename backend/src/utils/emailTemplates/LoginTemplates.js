import { baseTemplate } from "./BaseTemplate.js";

// ── 1. Registration OTP (userOtpGenerate) ─────────────────────────────────────
export const getOtpEmailTemplate = ({ otp, name }) =>
  baseTemplate({
    title: "Your OTP Code 🔐",
    body: `
      <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>
      <p style="font-size:14px;">Welcome to <strong>ForceHead</strong>. Use the verification code below:</p>
      <div style="text-align:center; margin:30px 0;">
        <span style="
          font-size:26px;
          letter-spacing:6px;
          font-weight:bold;
          background:#f1f5f9;
          padding:14px 24px;
          border-radius:6px;
          display:inline-block;">
          ${otp}
        </span>
      </div>
      <p style="font-size:13px; color:#6b7280;">This OTP is valid for a short time. Please do not share it with anyone.</p>
      <p>— <strong>ForceHead Team</strong></p>
    `,
  });

// ── 2. Welcome / account activated (setPassword) ──────────────────────────────
export const getWelcomePasswordEmailTemplate = ({ name, role }) =>
  baseTemplate({
    title: "Welcome to ForceHead 🚀",
    body: `
      <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>
      <p style="font-size:14px; line-height:1.6;">🎉 Your account has been successfully activated! You're now part of an intelligent Salesforce B2B ecosystem.</p>
      <div style="text-align:center; margin:25px 0;">
        <span style="
          font-size:15px;
          font-weight:bold;
          background:#eff6ff;
          color:#1e40af;
          padding:12px 24px;
          border-radius:8px;
          display:inline-block;">
          Role: ${role === "vendor" ? "Company" : role || "User"}
        </span>
      </div>
      <div style="margin-top:30px;">
        <h3 style="margin-bottom:15px; color:#1e3a8a;">🌐 Platform Features</h3>
        <ul style="padding-left:18px; font-size:14px; line-height:1.8; color:#374151;">
          <li><strong>Bench Resources</strong> – Manage and showcase available Salesforce talent.</li>
          <li><strong>Find Resources for Your Projects</strong> – Discover skilled professionals instantly.</li>
          <li><strong>Track Your Activity</strong> – Monitor connections, applications & engagements.</li>
          <li><strong>Connect with the Right Partner</strong> – Expand your trusted B2B network.</li>
        </ul>
      </div>
      <div style="margin-top:25px;">
        <h3 style="margin-bottom:15px; color:#1e3a8a;">🤖 AI Powered Features</h3>
        <ul style="padding-left:18px; font-size:14px; line-height:1.8; color:#374151;">
          <li><strong>AI Smart Matching</strong> – Instantly match projects with ideal Salesforce experts.</li>
          <li><strong>Salesforce B2B Connect</strong> – Instantly connect with verified Salesforce vendors and bench resources.</li>
          <li><strong>Resume & Skill Intelligence</strong> – Automated skill extraction and profiling.</li>
        </ul>
      </div>
      <p style="font-size:14px; margin-top:25px;">You can now securely log in and start exploring the platform.</p>
      <p style="font-size:13px; color:#6b7280;">If you did not create this password, please contact support immediately.</p>
      <p style="margin-top:30px;">— <strong>ForceHead Team</strong></p>
    `,
  });

// ── 3. Candidate verification OTP (verificationController) ────────────────────
export const getCandidateOtpEmailTemplate = (name, otp) =>
  baseTemplate({
    title: "Candidate Verification OTP 🔐",
    body: `
      <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>
      <p style="font-size:14px;">Welcome to <strong>ForceHead</strong>. Use the verification code below:</p>
      <div style="text-align:center; margin:30px 0;">
        <span style="
          font-size:26px;
          letter-spacing:6px;
          font-weight:bold;
          background:#f1f5f9;
          padding:14px 24px;
          border-radius:6px;
          display:inline-block;">
          ${otp}
        </span>
      </div>
      <p style="font-size:13px; color:#6b7280;">Please do not share this OTP with anyone.</p>
      <p>— <strong>ForceHead Team</strong></p>
    `,
  });
