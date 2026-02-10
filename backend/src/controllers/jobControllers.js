import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import puppeteer from "puppeteer";
import { generateResumeHTML } from "../utils/resumeTemplate.js";
import fs from "fs";
import path from "path";
// import { extractResumeSections } from "../utils/llmTextExtractor.js";
import { extractAIText } from "../utils/ai/extractAI.js";
import { logger } from "../utils/logger.js";
import { applyFilters } from "../utils/applyFilters.js";
import { queueRecruiterEmails } from "../utils/BulkEmail/jobEmail.service.js";
import { canCreate, canDelete, canEdit, canView } from "../utils/permission.js";

// User applies for a job

const userApplyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      logger.warn("Job ID missing in userApplyJob");
      return res
        .status(400)
        .json({ status: "error", message: "Job ID is required" });
    }

    // 1. Fetch Job
    const job = await prisma.job.findFirst({
      where: { id: jobId, isDeleted: false },
      include: {
        postedBy: { select: { id: true, name: true, email: true } },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res
        .status(404)
        .json({ status: "error", message: "Job not found" });
    }
    if (job.status !== "Open") {
      return res
        .status(200)
        .json({ status: "error", message: "No Longer Accepting Jobs" });
    }

    if (
      job.ApplicationLimit !== null &&
      job._count.applications >= job.ApplicationLimit
    ) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "Closed" },
      });

      return res.status(200).json({
        status: "error",
        message: "Application limit reached. Job is closed.",
      });
    }

    // 2. Fetch User Profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { CandidateProfile: true },
    });

    if (!user) {
      logger.warn(`User not found - ID: ${userId}`);
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (!user.CandidateProfile) {
      return res.status(404).json({
        status: "error",
        message: "Fill The Candidate Details First!",
      });
    }

    const profile = user.CandidateProfile;
    // 3. Check Existing Application
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_candidateProfileId: {
          jobId,
          candidateProfileId: profile.id,
        },
      },
    });

    if (existingApplication) {
      logger.warn(
        `User already applied - jobId: ${jobId}, user profile id: ${profile.id}`
      );
      return res
        .status(409)
        .json({ status: "error", message: "Already applied" });
    }

    // STEP 4: AI ANALYSIS (Real-time)
    let aiAnalysisResult = null;

    const jobDescription = {
      job_id: job?.id,
      role: job?.role,
      description: job?.description || "",
      employmentType: job?.employmentType || "FullTime",
      skills: job?.skills || [],
      clouds: job?.clouds || [],
      salary: job?.salary,
      companyName: job?.companyName,
      responsibilities: job?.responsibilities || [],
      qualifications: job?.qualifications || [],
      experience: job?.experience || "",
      experienceLevel: job?.experienceLevel || "",
      location: job?.location || "",
      companyName: job?.companyName || "",
    };

    const candidateDetails = {
      // id: profile?.id,
      userId: profile?.userId,
      profilePicture: profile?.profilePicture || null,
      title: profile?.title || "",
      name: profile?.name || "",
      phoneNumber: profile?.phoneNumber || "",
      email: profile?.email || "",
      currentLocation: profile?.currentLocation || "",
      preferredLocation: profile?.preferredLocation || [],
      portfolioLink: profile?.portfolioLink || "",
      preferredJobType: profile?.preferredJobType || [],
      currentCTC: profile?.currentCTC || "",
      expectedCTC: profile?.expectedCTC || "",
      rateCardPerHour: profile?.rateCardPerHour || {},
      joiningPeriod: profile?.joiningPeriod || "",
      totalExperience: profile?.totalExperience || "",
      relevantSalesforceExperience: profile?.relevantSalesforceExperience || "",
      skills: profile?.skillsJson || [],
      primaryClouds: profile?.primaryClouds || [],
      secondaryClouds: profile?.secondaryClouds || [],
      certifications: profile?.certifications || [],
      workExperience: profile?.workExperience || [],
      education: profile?.education || [],
      linkedInUrl: profile?.linkedInUrl || null,
      trailheadUrl: profile?.trailheadUrl || null,
    };

    // Only run AI if candidate has a profile
    if (user.CandidateProfile) {
      aiAnalysisResult = await extractAIText("CV_RANKING", "cvranker", {
        jobDescription,
        candidateDetails,
      });
      logger.info("aicvranker", JSON.stringify(aiAnalysisResult, null, 2));
    }

    // STEP 5: SAVE TO DB (Transaction)
    const application = await prisma.$transaction(async (tx) => {
      const currentCount = await tx.jobApplication.count({
        where: { jobId },
      });

      if (
        job.ApplicationLimit !== null &&
        currentCount >= job.ApplicationLimit
      ) {
        await tx.job.update({
          where: { id: jobId },
          data: { status: "Closed" },
        });

        throw new Error("APPLICATION_LIMIT_REACHED");
      }

      // Create the base Application
      const newApp = await tx.jobApplication.create({
        data: {
          jobId,
          userId,
          candidateProfileId: profile.id,
          appliedById: userId,
          status: "Pending",
        },
      });

      // Create the Analysis (if AI succeeded)
      if (aiAnalysisResult) {
        await tx.applicationAnalysis.create({
          data: {
            jobApplicationId: newApp.id,
            fitPercentage: aiAnalysisResult.fit_percentage || 0,
            details: aiAnalysisResult, // Stores the full JSON
            status: "COMPLETED",
          },
        });
      }

      if (
        job.ApplicationLimit !== null &&
        currentCount + 1 >= job.ApplicationLimit
      ) {
        await tx.job.update({
          where: { id: jobId },
          data: { status: "Closed" },
        });
      }

      return newApp;
    });

    // Generate resume HTML
    const resumeHTML = generateResumeHTML(user, user.CandidateProfile, job);
    let pdfBuffer;

    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(resumeHTML, { waitUntil: "networkidle0" });
      pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();
    } catch (pdfError) {
      logger.error(
        "PDF Generation Error:",
        JSON.stringify(pdfError.message, null, 2)
      );
    }

    // Send Email to Recruiter
    if (job.postedBy?.email) {
      try {
        await sendEmail({
          to: job.postedBy.email,
          subject: `New Application for ${job.role} - ${user.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">New Job Application Received! 🎉</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Application Details</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 10px 0;"><strong>Job Position:</strong> ${
                    job.role
                  }</p>
                  <p style="margin: 10px 0;"><strong>Company:</strong> ${
                    job.companyName
                  }</p>
                  <p style="margin: 10px 0;"><strong>Candidate Name:</strong> ${
                    user.name
                  }</p>
                  <p style="margin: 10px 0;"><strong>Candidate Email:</strong> ${
                    user.email
                  }</p>
                  <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}</p>
                </div>

                ${
                  user.CandidateProfile
                    ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #667eea; margin-top: 0;">Quick Summary</h3>
                  ${
                    user.CandidateProfile.title
                      ? `<p><strong>Current Role:</strong> ${user.CandidateProfile.title}</p>`
                      : ""
                  }
                  ${
                    user.CandidateProfile.totalExperience
                      ? `<p><strong>Experience:</strong> ${user.CandidateProfile.totalExperience}</p>`
                      : ""
                  }
                  ${
                    user.CandidateProfile.currentLocation
                      ? `<p><strong>Location:</strong> ${user.CandidateProfile.currentLocation}</p>`
                      : ""
                  }
                  ${
                    user.CandidateProfile.expectedCTC
                      ? `<p><strong>Expected CTC:</strong> ₹${user.CandidateProfile.expectedCTC}</p>`
                      : ""
                  }
                  ${
                    user.CandidateProfile.joiningPeriod
                      ? `<p><strong>Notice Period:</strong> ${user.CandidateProfile.joiningPeriod}</p>`
                      : ""
                  }
                </div>
                `
                    : ""
                }

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  📎 Please find the detailed resume attached to this email.
                </p>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  <em>This is an automated notification from the Job Portal.</em>
                </p>
              </div>
            </div>
          `,
          attachments: pdfBuffer
            ? [
                {
                  filename: `${user.name.replace(/\s+/g, "_")}_Resume.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ]
            : [],
        });
      } catch (emailError) {
        logger.error(
          "Error sending email to poster:",
          JSON.stringify(emailError.message, null, 2)
        );
      }
    }

    // Send Email to Candidate
    try {
      await sendEmail({
        to: user.email,
        subject: `Application Submitted - ${job.role} at ${job.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">Application Submitted Successfully! ✅</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px;">Hi ${user.name},</p>
              
              <p style="color: #666;">Your application has been successfully submitted for the following position:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Position:</strong> ${
                  job.role
                }</p>
                <p style="margin: 10px 0;"><strong>Company:</strong> ${
                  job.companyName
                }</p>
                <p style="margin: 10px 0;"><strong>Location:</strong> ${
                  job.location || "Not specified"
                }</p>
                <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}</p>
              </div>

              <p style="color: #666;">The employer will review your application and get back to you if your profile matches their requirements.</p>
              
              <p style="color: #666; margin-top: 20px;">Good luck! 🍀</p>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                <em>This is an automated confirmation from the Job Portal.</em>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      logger.error(
        "Error sending confirmation email:",
        JSON.stringify(emailError.message, null, 2)
      );
    }

    return res.status(201).json({
      status: "success",
      message: "Application submitted successfully",
      data: {
        application: {
          id: application.id,
          jobId: application.jobId,
          status: application.status,
          // Return the score to the frontend immediately if you want
          matchScore: aiAnalysisResult?.fit_percentage,
        },
      },
    });
  } catch (error) {
    if (error.message === "APPLICATION_LIMIT_REACHED") {
      return res.status(400).json({
        status: "error",
        message: "Application limit reached. Job is closed.",
      });
    }
    logger.error("userApplyJob Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to submit application:" + error.message,
    });
  }
};

const userAllApplyedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    // Get applications with job details
    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              role: true,
              companyName: true,
              location: true,
              salary: true,
              employmentType: true,
              experience: true,
              skills: true,
              description: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          appliedAt: "desc",
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(
      "userAllAppliedJobs Error:",
      JSON.stringify(error.message, null, 2)
    );
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch applied jobs" + error.message,
    });
  }
};

// const userSaveJob = async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     const userId = req.user.id;

//     if (!jobId) {
//       return res.status(200).json({
//         status: "failed",
//         message: "Job ID is required"
//       });
//     }

//     // Check if job exists
//     const job = await prisma.job.findUnique({
//       where: { id: jobId }
//     });

//     if (!job) {
//       logger.warn(`Job not found while saving - ID: ${jobId}`);
//       return res.status(404).json({
//         status: "error",
//         message: "Job not found"
//       });
//     }

//     if (job.isDeleted) {
//       logger.warn(`Attempt to save deleted job - ID: ${jobId}`);
//       return res.status(400).json({
//         status: "error",
//         message: "This job has been deleted"
//       });
//     }

//     // Check if already saved
//     const existingSave = await prisma.savedJob.findUnique({
//       where: {
//         jobId_userId: {
//           jobId,
//           userId
//         }
//       }
//     });

//     if (existingSave) {
//       logger.warn(`Job already saved - jobId: ${jobId}, userId: ${userId}`);
//       return res.status(409).json({
//         status: "error",
//         message: "Job already saved"
//       });
//     }

//     // Save the job
//     const savedJob = await prisma.savedJob.create({
//       data: {
//         jobId,
//         userId
//       },
//       include: {
//         job: {
//           select: {
//             id: true,
//             role: true,
//             companyName: true,
//             location: true,
//             salary: true
//           }
//         }
//       }
//     });

//     return res.status(201).json({
//       status: "success",
//       message: "Job saved successfully",
//       data: savedJob
//     });

//   } catch (error) {
//     logger.error("userSaveJob Error:", JSON.stringify(error.message,null,2));
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to save job" +  error.message,
//     });
//   }
// };

const userSaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { id: userId, role, organizationId } = req.user;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
      });
    }

    // Validate job
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.isDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Job not found or deleted",
      });
    }

    // -------------------------------
    //  ROLE: CANDIDATE → Normal save
    // -------------------------------
    if (role === "candidate") {
      const existing = await prisma.savedJob.findUnique({
        where: {
          jobId_userId: { jobId, userId },
        },
      });

      // if (existing) {
      //   return res.status(409).json({
      //     status: "error",
      //     message: "Job already saved",
      //   });
      // }
      if (existing) {
        return res.status(200).json({
          status: "success",
          message: "Job already saved",
          data: existing,
        });
      }

      const saved = await prisma.savedJob.create({
        data: {
          jobId,
          userId,
          organizationId: null, // candidate should not have org saves
        },
      });

      return res.status(201).json({
        status: "success",
        message: "Job saved successfully",
        data: saved,
      });
    }

    // -------------------------------
    //  ROLE: COMPANY → Org-wide save
    // -------------------------------
    if (!organizationId) {
      return res.status(400).json({
        status: "error",
        message: "organizationId missing in token",
      });
    }

    // Check if organization already saved this job
    const existingOrgSave = await prisma.savedJob.findUnique({
      where: {
        jobId_organizationId: {
          jobId,
          organizationId,
        },
      },
    });

    if (existingOrgSave) {
      // If soft-deleted → restore
      if (existingOrgSave.isDeleted) {
        const updated = await prisma.savedJob.update({
          where: { id: existingOrgSave.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            userId, // who restored it
            savedAt: new Date(),
          },
        });

        return res.status(200).json({
          status: "success",
          message: "Job restored for organization",
          data: updated,
        });
      }

      // return res.status(409).json({
      //   status: "error",
      //   message: "Job already saved for this organization",
      // });
      return res.status(200).json({
        status: "success",
        message: "Job already saved for this organization",
        data: existingOrgSave,
      });
    }

    // Create new org-wide saved job
    const saved = await prisma.savedJob.create({
      data: {
        jobId,
        userId, // recruiter who saved
        organizationId,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Job saved for organization",
      data: saved,
    });
  } catch (error) {
    logger.error("userSaveJob Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

// const userUnsaveJob = async (req, res) => {
//   try {
//     logger.info("unsave clicked")
//     const { jobId } = req.body;
//     const userId = req.user.id;

//      if (!jobId) {
//       logger.warn("Job ID missing in userUnsaveJob");
//       return res.status(400).json({
//         status: "error",
//         message: "Job ID is required"
//       });
//     }

//     // Delete saved job
//     const deleted = await prisma.savedJob.deleteMany({
//       where: {
//         jobId,
//         userId
//       }
//     });

//     if (deleted.count === 0) {
//       logger.warn(`Saved job not found - jobId: ${jobId}, userId: ${userId}`);
//       return res.status(404).json({
//         status: "error",
//         message: "Saved job not found"
//       });
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "Job removed from saved list"
//     });

//   } catch (error) {
//     logger.error("userUnsaveJob Error:", JSON.stringify(error.message,null,2));
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to unsave job" + error.message,
//     });
//   }
// };

const userUnsaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const { id: userId, role, organizationId } = req.user;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
      });
    }

    // -----------------------------------------
    // ROLE: CANDIDATE → Hard delete own saved job
    // -----------------------------------------
    if (role === "candidate") {
      const deleted = await prisma.savedJob.deleteMany({
        where: { jobId, userId },
      });

      if (deleted.count === 0) {
        return res.status(404).json({
          status: "error",
          message: "Saved job not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Job removed from saved list",
      });
    }

    // -----------------------------------------
    // ROLE: COMPANY → Soft delete for organization
    // -----------------------------------------
    const existing = await prisma.savedJob.findUnique({
      where: {
        jobId_organizationId: {
          jobId,
          organizationId,
        },
      },
    });

    if (!existing || existing.isDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Job not saved for this organization",
      });
    }

    await prisma.savedJob.update({
      where: { id: existing.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Job unsaved for organization",
    });
  } catch (error) {
    logger.error("userUnsaveJob Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

// const userAllSavedJobs = async (req, res) => {
//   try {
//      const { id: userId, role, organizationId } = req.user;
//     const { page = 1, limit = 10 } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Get saved jobs with job details
//     const [savedJobs, total] = await Promise.all([
//       prisma.savedJob.findMany({
//         where: { userId },
//         include: {
//           job: {
//             select: {
//               id: true,
//               role: true,
//               companyName: true,
//               location: true,
//               salary: true,
//               employmentType: true,
//               experience: true,
//               skills: true,
//               description: true,
//               status: true,
//               applicationDeadline: true,
//               createdAt: true
//             }
//           }
//         },
//         orderBy: {
//           savedAt: "desc"
//         },
//         skip,
//         take: parseInt(limit)
//       }),
//       prisma.savedJob.count({ where: { userId } })
//     ]);

//     // Format response + add deadline warning + add isSaved flag
//     const formattedJobs = savedJobs.map(saved => {
//       const deadlineDate = new Date(saved.job.applicationDeadline);
//       const today = new Date();
//       const daysUntilDeadline = Math.ceil(
//         (deadlineDate - today) / (1000 * 60 * 60 * 24)
//       );

//       return {
//         ...saved.job,            // flatten job details
//         isSaved: true,           // ADD THIS → unify with getJobList
//         savedAt: saved.savedAt,  // keep saved timestamp if needed
//         deadlineWarning:
//           daysUntilDeadline <= 7 && daysUntilDeadline > 0,
//         daysUntilDeadline
//       };
//     });

//     return res.status(200).json({
//       status: "success",
//       data: {
//         savedJobs: formattedJobs,
//         pagination: {
//           total,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           totalPages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     logger.error("userAllSavedJobs Error:", JSON.stringify(error.message,null,2));
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to fetch saved jobs" + error.message,
//     });
//   }
// };

function formatSavedJob(saved) {
  const deadlineDate = saved.job.applicationDeadline
    ? new Date(saved.job.applicationDeadline)
    : null;

  let daysUntilDeadline = null;
  let deadlineWarning = false;

  if (deadlineDate) {
    const today = new Date();
    daysUntilDeadline = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );

    deadlineWarning = daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  }

  return {
    ...saved.job,
    isSaved: true,
    savedAt: saved.savedAt,
    deadlineWarning,
    daysUntilDeadline,
  };
}

const userAllSavedJobs = async (req, res) => {
  try {
    const { id: userId, role, organizationId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // --------------------------------------------
    // 1️⃣ CANDIDATE FLOW — NORMAL SAVE
    // --------------------------------------------
    if (role === "candidate") {
      const [savedJobs, total] = await Promise.all([
        prisma.savedJob.findMany({
          where: { userId, isDeleted: false },
          include: {
            job: {
              select: {
                id: true,
                role: true,
                companyName: true,
                location: true,
                salary: true,
                employmentType: true,
                experience: true,
                skills: true,
                clouds: true,
                description: true,
                status: true,
                applicationDeadline: true,
                createdAt: true,
                postedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { savedAt: "desc" },
          skip,
          take: parseInt(limit),
        }),
        prisma.savedJob.count({ where: { userId, isDeleted: false } }),
      ]);

      const formattedJobs = savedJobs.map((saved) => formatSavedJob(saved));

      return res.status(200).json({
        status: "success",
        data: {
          savedJobs: formattedJobs,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    }

    // --------------------------------------------
    // 2️⃣ COMPANY FLOW — ORGANIZATION-WIDE SAVED JOBS
    // --------------------------------------------
    const [orgSavedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { organizationId, isDeleted: false },
        include: {
          job: {
            select: {
              id: true,
              role: true,
              companyName: true,
              location: true,
              salary: true,
              employmentType: true,
              experience: true,
              skills: true,
              clouds: true,
              description: true,
              status: true,
              applicationDeadline: true,
              createdAt: true,
              postedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true }, // savedBy
          },
        },
        orderBy: { savedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.savedJob.count({ where: { organizationId, isDeleted: false } }),
    ]);

    const formattedJobs = orgSavedJobs.map((saved) => ({
      ...formatSavedJob(saved),
      savedBy: saved.user, // who saved this job
    }));

    return res.status(200).json({
      status: "success",
      data: {
        savedJobs: formattedJobs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error("userAllSavedJobs Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch saved jobs: " + error.message,
    });
  }
};

const userWithdrawJob = async (req, res) => {
  try {
    // TODO: Implement withdraw application logic
    // - Extract userId and jobId from req
    // - Check if application exists
    // - Delete application record
    // - Return success response
    return res.status(501).json({
      status: "not_implemented",
      message: "User withdraw job functionality pending",
    });
  } catch (error) {
    logger.error(
      "userWithdrawJob Error:",
      JSON.stringify(error.message, null, 2)
    );
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

const getJobList = async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const filters = req.body.filters || {};

    const userId = req.user?.id;
    const role = req.user?.role;
    const organizationId = req.user?.organizationId;

    // --------------------------------------------
    // STEP 1: FETCH ALL JOBS
    // --------------------------------------------
    const allJobs = await prisma.job.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        savedBy: {
          where: {
            isDeleted: false,
            ...(role === "candidate"
              ? { userId } // candidate → only own saves
              : { organizationId }), // company → anyone in org
          },
          select: {
            id: true,
          },
        },
      },
    });

    // --------------------------------------------
    // STEP 2: ADD isSaved FLAG
    // --------------------------------------------
    const jobsWithSavedStatus = allJobs.map((job) => ({
      ...job,
      isSaved: job.savedBy && job.savedBy.length > 0,
    }));

    // --------------------------------------------
    // STEP 3: APPLY FILTERS (IN-MEMORY)
    // --------------------------------------------
    const filteredJobs = applyFilters(jobsWithSavedStatus, filters);

    // --------------------------------------------
    // STEP 4: PAGINATION
    // --------------------------------------------
    const totalCount = filteredJobs.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(skip, skip + limit);

    return res.status(200).json({
      status: "success",
      jobs: paginatedJobs,
      totalCount,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("getJobList Error:", error.message);
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

const postJob = async (req, res) => {
  try {
    const { id: recruiterId, organizationId, permission } = req.user;

    if (!canCreate(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to post jobs",
      });
    }

    const {
      role,
      description,
      employmentType,
      experience,
      experienceLevel,
      tenure,
      location,
      skills,
      clouds,
      salary,
      companyName,
      responsibilities,
      certifications,
      jobType,
      applicationDeadline,
      ApplicationLimit,
      companyLogo,
    } = req.body;

    // ✅ NORMALIZE TENURE (CREATE)
    let normalizedTenure = null;

    if (["PartTime", "Contract", "Freelancer"].includes(employmentType)) {
      const tenureNumber = tenure?.number;

      if (
        tenureNumber === undefined ||
        tenureNumber === null ||
        tenureNumber === ""
      ) {
        return res.status(400).json({
          status: "error",
          message: "Tenure is required for Part Time / Contract jobs",
        });
      }

      normalizedTenure = {
        number: String(tenureNumber),
        type: tenure?.type || "month",
      };
    }

    const job = await prisma.job.create({
      data: {
        role,
        description,
        employmentType,
        experience,
        experienceLevel,
        location,
        // tenure,
        tenure: normalizedTenure,

        skills,
        clouds,
        salary,
        companyName,
        responsibilities,
        certifications,
        jobType,
        applicationDeadline,
        ApplicationLimit,
        companyLogo,
        postedById: recruiterId, // optional
        organizationId,
      },
    });

    logger.info(`Job posted successfully - jobId: ${job.id}`);

    res.status(201).json({
      status: "success",
      message: "Job posted successfully",
      job,
    });

    (async () => {
      try {
        const recruiters = await prisma.users.findMany({
          where: {
            role: "company",
          },
          select: {
            email: true,
            id: true,
          },
        });

        if (!recruiters.length) {
          console.warn("No recruiters found for email notification");
          return;
        }

        await queueRecruiterEmails(recruiters, job);

        console.log(
          `Queued job emails for ${recruiters.length} recruiters (jobId: ${job.id})`
        );
      } catch (emailError) {
        // ❗ DO NOT throw — email failure should not break job posting
        logger.error(
          "Failed to queue recruiter emails",
          JSON.stringify(emailError.message, null, 2)
        );
      }
    })();
  } catch (error) {
    logger.error("postJob Error:", JSON.stringify(error.message, null, 2));
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

const postedJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { organizationId, permission } = req.user;

    if (!canView(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot view jobs",
      });
    }

    // 🟢 Fetch jobs + applicant count
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        where: {
          organizationId,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },

        // 🔑 Count applications per job
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),

      prisma.job.count({
        where: {
          organizationId,
          isDeleted: false,
        },
      }),
    ]);

    // 🧠 Transform response → add applicantCount
    const jobsWithApplicantCount = jobs.map((job) => {
      const { _count, ...jobData } = job;

      return {
        ...jobData,
        applicantCount: _count.applications || 0,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Posted jobs fetched successfully",
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      jobs: jobsWithApplicantCount,
    });
  } catch (error) {
    logger.error(
      "postedJobs POST Error:",
      JSON.stringify(error.message, null, 2)
    );

    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

// Edit job posted by company or vendor
const editJob = async (req, res) => {
  try {
    const { organizationId, permission } = req.user;

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to edit jobs",
      });
    }

    const {
      id, // the job ID to update
      role,
      description,
      employmentType,
      experience,
      experienceLevel,
      tenure,
      location,
      skills,
      clouds,
      salary,
      companyName,
      responsibilities,
      qualifications,
      jobType,
      status,
      applicationDeadline,
      ApplicationLimit,
      companyLogo,
    } = req.body;

    // Check if job exists first
    const existingJob = await prisma.job.findUnique({
      where: { id: id },
    });

    if (!existingJob) {
      logger.warn(`Job not found for update - ID: ${id}`);
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Optional: check if user is authorized to edit
    if (
      existingJob.organizationId &&
      existingJob.organizationId !== organizationId
    ) {
      logger.warn(
        `Unauthorized job edit attempt - jobId: ${id}, userId: ${req.user.id} from ORGID: ${organizationId}`
      );
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to edit this job",
      });
    }

    // ✅ PRESERVE TENURE ON EDIT
    let finalTenure = existingJob.tenure;

    if (["PartTime", "Contract", "Freelancer"].includes(employmentType)) {
      if (tenure?.number) {
        finalTenure = {
          number: String(tenure.number),
          type: tenure.type || "month",
        };
      }
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        id, // the job ID to update
        role,
        description,
        employmentType,
        experience,
        experienceLevel,
        // tenure,
        tenure: finalTenure,

        location,
        skills,
        salary,
        clouds,
        companyName,
        responsibilities,
        qualifications,
        jobType,
        status,
        applicationDeadline,
        ApplicationLimit,
        companyLogo,
      },
    });

    logger.info(`Job updated successfully - jobId: ${id}`);

    return res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    logger.error("editJob Error:", JSON.stringify(error.message, null, 2));
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// shruthi
// Delete job posted by company or vendor
const deleteJob = async (req, res) => {
  logger.info("Delete Job API hit");
  try {
    const { organizationId, permission } = req.user;

    if (!canDelete(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot delete jobs",
      });
    }

    const { jobIds, deletedReason } = req.body; // For multiple delete

    if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
      await prisma.job.updateMany({
        where: { id: { in: jobIds }, organizationId },
        data: {
          isDeleted: true,
          deletedReason,
          deletedAt: new Date(),
        },
      });

      return res.status(200).json({
        status: "success",
        message: "jobs deleted successfully",
      });
    }
  } catch (error) {
    logger.error("deleteJob Error:", JSON.stringify(error.message, null, 2));
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { organizationId, permission } = req.user;

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to close jobs",
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.isDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    if (job.organizationId !== organizationId) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to close this job",
      });
    }

    if (job.status === "Closed") {
      return res.status(200).json({
        status: "success",
        message: "Job already closed",
      });
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "Closed" },
    });

    return res.status(200).json({
      status: "success",
      message: "Job closed successfully",
    });
  } catch (error) {
    logger.error("closeJob Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to close job",
    });
  }
};

const getJobDetails = async (req, res) => {
  try {
    const { jobid } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;
    const organizationId = req.user?.organizationId;

    const job = await prisma.job.findFirst({
      where: { id: jobid, isDeleted: false },
      include: {
        savedBy: {
          where: {
            isDeleted: false,
            ...(role === "candidate"
              ? { userId } // candidate → own saved job
              : { organizationId }), // company → org saved job
          },
          select: { id: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // 🔑 Add isSaved flag
    const jobWithSavedStatus = {
      ...job,
      isSaved: job.savedBy && job.savedBy.length > 0,
    };

    // optional: remove savedBy array from response
    delete jobWithSavedStatus.savedBy;

    return res.status(200).json({
      status: "success",
      job: jobWithSavedStatus,
    });
  } catch (error) {
    logger.error("getJobDetails Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getApplicantsByJobId = async (req, res) => {
  try {
    const { organizationId, permission } = req.user;
    const { jobId } = req.body;

    if (!canView(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You cannot view applicants",
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.organizationId !== organizationId) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Fetch data (WITHOUT Prisma sorting)
    const applicants = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        candidateProfile: {
          include: {
            CandidateRating: {
              select: {
                rating: true,
                comment: true,
              },
            },
          },
        },
        analysis: {
          select: {
            fitPercentage: true,
            details: true,
            status: true,
          },
        },
      },
    });

    if (applicants.length === 0) {
      logger.info(`No applicants found for jobId ${jobId}`);
      return res.status(200).json({
        status: "success",
        message: "No applications found",
        data: [],
      });
    }

    // -------------------------
    // ⭐ CUSTOM SORT (JS Layer)
    // -------------------------
    applicants.sort((a, b) => {
      const scoreA = a.analysis?.fitPercentage ?? -1; // NULL → -1
      const scoreB = b.analysis?.fitPercentage ?? -1; // NULL → -1

      // 1️⃣ Match score high → low
      if (scoreA !== scoreB) return scoreB - scoreA;

      // 2️⃣ If same score → latest applied first
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    });

    // Format response
    // const formattedApplicants = applicants.map((app) => ({
    //   applicationId: app.id,
    //   status: app.status,
    //   appliedAt: app.appliedAt,
    //   userId: app.id,
    //   name: app.candidateProfile?.name,
    //   email: app.candidateProfile?.email,
    //   profile: app.candidateProfile,
    //   matchScore: app.analysis?.fitPercentage ?? null,
    //   aiAnalysis: app.analysis?.details ?? null

    // }));

    const formattedApplicants = applicants.map((app) => {
      const ratings = app.candidateProfile?.CandidateRating || [];

      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = ratings.length ? total / ratings.length : null;

      return {
        applicationId: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        name: app.candidateProfile?.name,
        email: app.candidateProfile?.email,
        profile: app.candidateProfile,
        matchScore: app.analysis?.fitPercentage ?? null,
        aiAnalysis: app.analysis?.details ?? null,
        avgRating, // e.g. 3.33
        ratingCount: ratings.length,
        ratingReviews: ratings, // [{ rating, comment }]
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Applicants fetched successfully",
      count: formattedApplicants.length,
      data: formattedApplicants,
    });
  } catch (error) {
    logger.error("Error fetching applicants:", JSON.stringify(error, null, 2));
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

const getUserAppliedJobsId = async (req, res) => {
  try {
    const userAuth = req.user;
    const userJobid = await prisma.jobApplication.findMany({
      where: {
        userId: userAuth.id,
      },
      select: {
        jobId: true,
      },
    });

    if (!userJobid) {
      logger.warn("User applied jobs fetch failed");
      return res.status(500).json({
        status: "error",
        message: "Could not Fetch Job Details",
      });
    }

    const jobids = userJobid.map((item) => item.jobId);

    res.status(200).json({
      status: "success",
      message: "successfully fetched job details",
      jobids,
    });
  } catch (error) {
    logger.error(
      `getUserAppliedJobsId Error: ${JSON.stringify(error.message, null, 2)}`
    );
    return res.status(500).json({
      status: "error",
      message: `Something went wrong!${error.message}`,
    });
  }
};

const saveCandidateRating = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { candidateProfileId, rating, comment } = req.body;

    if (!candidateProfileId || !rating) {
      return res.status(400).json({
        status: "error",
        message: "candidateProfileId and rating are required",
      });
    }

    const result = await prisma.candidateRating.upsert({
      where: {
        recruiterId_candidateProfileId: {
          recruiterId,
          candidateProfileId,
        },
      },
      create: {
        recruiterId,
        candidateProfileId,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Rating saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("saveCandidateRating error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to save rating",
    });
  }
};

export {
  userApplyJob,
  userAllApplyedJobs,
  userWithdrawJob,
  userSaveJob,
  userUnsaveJob,
  userAllSavedJobs,
  getJobList,
  postJob,
  editJob,
  deleteJob,
  postedJobs,
  getJobDetails,
  getApplicantsByJobId,
  getUserAppliedJobsId,
  saveCandidateRating,
  closeJob,
};
