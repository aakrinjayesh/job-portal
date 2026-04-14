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

  // Admin created acoount sending mail
  // export const getAdminCreatedAccountEmailTemplate = ({ name, username, password, role }) =>
  // baseTemplate({
  //   title: "Your Account Has Been Created 🎉",
  //   body: `
  //     <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>
  //     <p style="font-size:14px; line-height:1.6;">
  //       An administrator has created an account for you on <strong>ForceHead</strong>. 
  //       You can log in right away using the credentials below.
  //     </p>

  //     <!-- Credentials Box -->
  //     <div style="
  //       background:#f8fafc;
  //       border:1px solid #e2e8f0;
  //       border-radius:10px;
  //       padding:20px 24px;
  //       margin:28px 0;
  //     ">
  //       <p style="
  //         font-size:11px;
  //         font-weight:600;
  //         letter-spacing:0.1em;
  //         text-transform:uppercase;
  //         color:#94a3b8;
  //         margin:0 0 16px;
  //       ">Your Login Credentials</p>

  //       <table style="width:100%; border-collapse:collapse; font-size:14px;">
  //         <tr>
  //           <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; width:110px;">Username</td>
  //           <td style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
  //             <strong style="
  //               font-family:monospace;
  //               font-size:15px;
  //               color:#1e3a8a;
  //               background:#eff6ff;
  //               padding:3px 10px;
  //               border-radius:5px;
  //               display:inline-block;
  //             ">${username}</strong>
  //           </td>
  //         </tr>
  //         <tr>
  //           <td style="padding:10px 0; color:#64748b;">Password</td>
  //           <td style="padding:10px 0;">
  //             <strong style="
  //               font-family:monospace;
  //               font-size:15px;
  //               color:#1e3a8a;
  //               background:#eff6ff;
  //               padding:3px 10px;
  //               border-radius:5px;
  //               display:inline-block;
  //             ">${password}</strong>
  //           </td>
  //         </tr>
  //       </table>
  //     </div>

  //     <!-- Role Badge -->
  //     <div style="text-align:center; margin:0 0 28px;">
  //       <span style="
  //         font-size:13px;
  //         font-weight:600;
  //         background:#eff6ff;
  //         color:#1e40af;
  //         padding:8px 20px;
  //         border-radius:20px;
  //         display:inline-block;
  //         letter-spacing:0.02em;
  //       ">Role: ${role === "vendor" ? "Company" : role || "User"}</span>
  //     </div>

  //     <!-- Security Notice -->
  //     <div style="
  //       background:#fffbeb;
  //       border-left:4px solid #f59e0b;
  //       border-radius:0 8px 8px 0;
  //       padding:12px 16px;
  //       margin-bottom:28px;
  //       font-size:13px;
  //       color:#92400e;
  //       line-height:1.6;
  //     ">
  //       <strong>⚠ Security Notice:</strong> For your protection, please change your password 
  //       after your first login. Do not share your credentials with anyone.
  //     </div>

  //      <!-- Forgot Password tip -->
  //     <p style="font-size:13px; color:#6b7280; line-height:1.6; margin-bottom:28px;">
  //       Want to change your password? Use the 
  //       <a href="https://www.forcehead.com/forgotpassword" style="color:#1e40af; text-decoration:none; font-weight:600;">
  //         Forgot Password
  //       </a> 
  //       option on the login page.
  //     </p>

  //     <!-- Login CTA -->
  //     <div style="text-align:center; margin:28px 0;">
  //       <a href="https://www.forcehead.com/" style="
  //         display:inline-block;
  //         background:#1e40af;
  //         color:#ffffff;
  //         font-size:14px;
  //         font-weight:600;
  //         padding:13px 32px;
  //         border-radius:8px;
  //         text-decoration:none;
  //         letter-spacing:0.02em;
  //       ">Log In to ForceHead →</a>
  //     </div>

  //     <p style="font-size:13px; color:#6b7280; line-height:1.6;">
  //       If you did not expect this email or believe this account was created in error, 
  //       please contact our support team immediately.
  //     </p>

  //     <p style="margin-top:28px; font-size:14px;">— <strong>ForceHead Team</strong></p>
  //   `,
  // });

 export const getAdminCreateUserWelcomeEmailTemplate = ({ name, email, role }) =>
  baseTemplate({
    title: "Your Account Has Been Created 🎉",
    body: `
      <p style="font-size:16px;">Hi <strong>${name || "there"}</strong>,</p>
      <p style="font-size:14px; line-height:1.6;">
        An administrator has created an account for you on <strong>ForceHead</strong>. 
        Your account details are below — click the button to set your password and get started.
      </p>

      <!-- Account Details Box -->
      <div style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:10px;
        padding:20px 24px;
        margin:28px 0;
      ">
        <p style="
          font-size:11px;
          font-weight:600;
          letter-spacing:0.1em;
          text-transform:uppercase;
          color:#94a3b8;
          margin:0 0 16px;
        ">Your Account Details</p>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; width:110px;">Email</td>
            <td style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
              <strong style="
                font-family:monospace;
                font-size:15px;
                color:#1e3a8a;
                background:#eff6ff;
                padding:3px 10px;
                border-radius:5px;
                display:inline-block;
              ">${email}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:#64748b;">Role</td>
            <td style="padding:10px 0;">
              <strong style="
                font-family:monospace;
                font-size:15px;
                color:#1e3a8a;
                background:#eff6ff;
                padding:3px 10px;
                border-radius:5px;
                display:inline-block;
                text-transform:capitalize;
              ">${role === "vendor" ? "Company" : role || "User"}</strong>
            </td>
          </tr>
        </table>
      </div>

      <!-- Info Notice -->
      <div style="
        background:#fffbeb;
        border-left:4px solid #f59e0b;
        border-radius:0 8px 8px 0;
        padding:12px 16px;
        margin-bottom:28px;
        font-size:13px;
        color:#92400e;
        line-height:1.6;
      ">
        <strong>👋 Next Step:</strong> Your account is ready. Please set your password 
        using the button below to activate your account.
      </div>

      <!-- Set Password CTA -->
      <div style="text-align:center; margin:28px 0;">
        <a href="http://localhost:5174/createpassword?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}" style="
          display:inline-block;
          background:#1e40af;
          color:#ffffff;
          font-size:14px;
          font-weight:600;
          padding:13px 32px;
          border-radius:8px;
          text-decoration:none;
          letter-spacing:0.02em;
        ">Set Your Password →</a>
      </div>

      <!-- Fallback link -->
      <p style="font-size:12px; color:#9ca3af; text-align:center; word-break:break-all;">
        Or copy this link: 
        https://www.forcehead.com/createpassword?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}
      </p>

      <p style="font-size:13px; color:#6b7280; line-height:1.6; margin-top:24px;">
        If you did not expect this email or believe this account was created in error, 
        please contact our support team immediately.
      </p>

      <p style="margin-top:28px; font-size:14px;">— <strong>ForceHead Team</strong></p>
    `,
  });
