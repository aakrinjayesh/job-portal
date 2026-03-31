import prisma from "../config/prisma.js";
import sendEmail from "../utils/sendEmail.js";
import { extractAIText } from "../utils/ai/extractAI.js";
import { logger } from "../utils/logger.js";
import { applyFilters } from "../utils/applyFilters.js";
import { queueJobEmails } from "../utils/BulkEmail/jobEmail.service.js";
import { canCreate, canDelete, canEdit, canView } from "../utils/permission.js";
import { handleError } from "../utils/handleError.js";
// import { cvEligibilityCheckInternal } from "./cvRankerControllers.js";

const userApplyJob = async (req, res) => {
  try {
    const { jobId, answers = [] } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
      });
    }

    /* ───────── FETCH JOB ───────── */
    const job = await prisma.job.findFirst({
      where: { id: jobId, isDeleted: false },
      include: {
        postedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    if (job.status !== "Open") {
      return res.status(400).json({
        status: "error",
        message: "No Longer Accepting Applications",
      });
    }

    /* ───────── FETCH USER PROFILE ───────── */
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { CandidateProfile: true },
    });

    if (!user?.CandidateProfile) {
      return res.status(404).json({
        status: "error",
        message: "Fill The Candidate Details First!",
      });
    }

    const profile = user.CandidateProfile;

    /* ───────── DUPLICATE APPLY CHECK ───────── */
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_candidateProfileId: {
          jobId,
          candidateProfileId: profile.id,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        status: "error",
        message: "Already applied",
      });
    }

    /* ───────── SCREENING QUESTIONS ───────── */
    const jobQuestions = await prisma.jobApplicationQuestion.findMany({
      where: { jobId },
      orderBy: { order: "asc" },
    });

    if (jobQuestions.length > 0) {
      const answerMap = {};
      answers.forEach((a) => {
        answerMap[a.questionId] = a.answerText;
      });

      for (const q of jobQuestions) {
        if (q.required) {
          const val = answerMap[q.id];
          if (!val || String(val).trim() === "") {
            return res.status(400).json({
              status: "error",
              message: `Answer required for: "${q.question}"`,
              questionId: q.id,
            });
          }
        }
      }
    }

    /* ───────── CHECK AI LICENSE ───────── */
    let aiAllowed = false;
    let recruiterLicense = null;
    let recruiterSeatId = null;
    let limitConfigs = [];
    let recruiterMember = null;

    if (job.postedById) {
      recruiterMember = await prisma.organizationMember.findUnique({
        where: { userId: job.postedById },
      });

      if (recruiterMember) {
        // 🔥 Correct license fetching (handles renewals + expiry)
        recruiterLicense = await prisma.license.findFirst({
          where: {
            assignedToId: recruiterMember.id,
            isActive: true,
            validFrom: {
              lte: new Date(),
            },
            validUntil: {
              gte: new Date(),
            },
          },
          orderBy: {
            validUntil: "desc",
          },
          include: {
            plan: {
              include: {
                limits: true,
              },
            },
          },
        });

        recruiterSeatId = recruiterLicense?.seatId || null;
      }

      if (recruiterLicense) {
        limitConfigs = recruiterLicense.plan.limits.filter(
          (l) => l.feature === "AI_FIT_SCORE",
        );

        aiAllowed = true;

        for (const limit of limitConfigs) {
          if (limit.period === "DAILY") continue;

          const now = new Date();
          let periodStart;

          if (limit.period === "MONTHLY") {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          } else if (limit.period === "YEARLY") {
            periodStart = new Date(now.getFullYear(), 0, 1);
          }

          const usage = await prisma.usageRecord.findUnique({
            where: {
              licenseId_feature_period_periodStart: {
                licenseId: recruiterLicense.id, // 🔥 IMPORTANT
                feature: "AI_FIT_SCORE",
                period: limit.period,
                periodStart,
              },
            },
          });

          if (usage && usage.currentUsage >= limit.maxAllowed) {
            aiAllowed = false;
            break;
          }
        }
      }
    }

    /* ───────── CREATE APPLICATION ───────── */
    const application = await prisma.$transaction(async (tx) => {
      const newApp = await tx.jobApplication.create({
        data: {
          jobId,
          userId,
          candidateProfileId: profile.id,
          appliedById: userId,
          status: "Pending",
        },
      });

      if (answers.length) {
        await tx.jobApplicationAnswer.createMany({
          data: answers.map((a) => ({
            applicationId: newApp.id,
            questionId: a.questionId,
            answerText: String(a.answerText ?? ""),
          })),
        });
      }

      return newApp;
    });

    /* ───────── CLOSE JOB IF LIMIT REACHED ───────── */
    if (job.ApplicationLimit) {
      const newCount = job._count.applications + 1;

      if (newCount >= job.ApplicationLimit) {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "Closed" },
        });
      }
    }

    /* ───────── SEND RESPONSE IMMEDIATELY ───────── */
    res.status(201).json({
      status: "success",
      message: "Application submitted successfully",
      processing: true,
      data: {
        id: application.id,
      },
    });

    /* ───────── BACKGROUND PROCESSING ───────── */
    const alreadyScoredCount = await prisma.applicationAnalysis.count({
      where: {
        jobApplication: { jobId },
      },
    });

    if (alreadyScoredCount < 5) {
      processCandidateApplicationInBackground({
        application,
        profile,
        user,
        job,
        aiAllowed,
        recruiterLicense,
        recruiterSeatId,
        recruiterMember,
        limitConfigs,
      });
    }
  } catch (error) {
    console.error("userApplyJob Error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to submit application",
      metadata: error.message,
    });
  }
};

const processCandidateApplicationInBackground = async ({
  application,
  profile,
  user,
  job,
  aiAllowed,
  recruiterLicense,
  recruiterSeatId,
  recruiterMember,
  limitConfigs,
}) => {
  try {
    let aiAnalysisResult = null;
    let tokenUsage = null;

    /* ───────── AI ANALYSIS ───────── */
    if (aiAllowed) {
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
      };

      const candidateDetails = {
        // id: profile?.id,
        // userId: profile?.userId,
        // profilePicture: profile?.profilePicture || null,
        title: profile?.title || "",
        // name: profile?.name || "",
        // phoneNumber: profile?.phoneNumber || "",
        // email: profile?.email || "",
        currentLocation: profile?.currentLocation || "",
        preferredLocation: profile?.preferredLocation || [],
        portfolioLink: profile?.portfolioLink || "",
        preferredJobType: profile?.preferredJobType || [],
        currentCTC: profile?.currentCTC || "",
        expectedCTC: profile?.expectedCTC || "",
        rateCardPerHour: profile?.rateCardPerHour || {},
        joiningPeriod: profile?.joiningPeriod || "",
        totalExperience: profile?.totalExperience || "",
        relevantSalesforceExperience:
          profile?.relevantSalesforceExperience || "",
        skills: profile?.skillsJson || [],
        primaryClouds: profile?.primaryClouds || [],
        secondaryClouds: profile?.secondaryClouds || [],
        certifications: profile?.certifications || [],
        workExperience: profile?.workExperience || [],
        education: profile?.education || [],
        linkedInUrl: profile?.linkedInUrl || null,
        trailheadUrl: profile?.trailheadUrl || null,
      };

      try {
        const aiResponse = await extractAIText("CV_RANKING", "cvranker", {
          jobDescription,
          candidateDetails,
        });

        if (aiResponse?.data) {
          aiAnalysisResult = aiResponse.data;
          tokenUsage = aiResponse.tokenUsage ?? null;
        }
      } catch (err) {
        logger.error("AI analysis failed:", err.message);
      }
    }

    /* ───────── SAVE AI RESULT ───────── */
    if (aiAllowed && aiAnalysisResult && recruiterSeatId) {
      const now = new Date();

      await prisma.$transaction(async (tx) => {
        await tx.applicationAnalysis.create({
          data: {
            jobApplicationId: application.id,
            fitPercentage: aiAnalysisResult.fit_percentage || 0,
            details: aiAnalysisResult,
            status: "COMPLETED",
          },
        });

        for (const limit of limitConfigs) {
          let periodStart;
          let periodEnd;

          if (limit.period === "DAILY") {
            periodStart = new Date(new Date().setHours(0, 0, 0, 0));
            periodEnd = new Date(new Date().setHours(23, 59, 59, 999));
          } else if (limit.period === "MONTHLY") {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          } else if (limit.period === "YEARLY") {
            periodStart = new Date(now.getFullYear(), 0, 1);
            periodEnd = new Date(now.getFullYear(), 11, 31);
          }

          await tx.usageRecord.upsert({
            where: {
              licenseId_feature_period_periodStart: {
                licenseId: recruiterLicense.id, // 🔥 FIX
                feature: "AI_FIT_SCORE",
                period: limit.period,
                periodStart,
              },
            },
            update: {
              currentUsage: { increment: 1 },
            },
            create: {
              licenseId: recruiterLicense.id, // 🔥 FIX
              seatId: recruiterSeatId, // optional (keep for tracking)
              feature: "AI_FIT_SCORE",
              period: limit.period,
              currentUsage: 1,
              periodStart,
              periodEnd,
            },
          });
        }

        await tx.aITokenUsage.create({
          data: {
            organizationId: recruiterMember.organizationId,
            userId: job.postedById,
            seatId: recruiterSeatId,
            licenseId: recruiterLicense?.id ?? null,
            inputTokens: tokenUsage?.prompt || 0,
            outputTokens: tokenUsage?.completion || 0,
            totalTokens: tokenUsage?.total || 0,
            featureUsed: "AI_FIT_SCORE",
          },
        });
      });
    }

    /* ───────── SEND RECRUITER EMAIL ───────── */
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
                 
                  <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
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
                 <div style="text-align: center; margin: 30px 0;">
  <a href="${process.env.FRONTEND_URL}/company/candidate/${user.id}"
     style="
        display: inline-block;
        padding: 14px 28px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        text-decoration: none;
        font-weight: bold;
        border-radius: 8px;
        font-size: 15px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
     ">
     👁️ View Full Application Details
  </a>
</div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  📎 Please find the detailed resume attached to this email.
                </p>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  <em>This is an automated notification from the Job Portal.</em>
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Recruiter email failed:", emailError.message);
      }
    }

    /* ───────── SEND CANDIDATE EMAIL ───────── */
    try {
      await sendEmail({
        to: user.email,
        subject: `Application Submitted - ${job.role} at ${job.companyName}`,
        html: `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #2196F3 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0;">Application Submitted Successfully! ✅</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
      <p style="color: #333; font-size: 16px;">Hi ${user.name},</p>
      
      <p style="color: #666;">
        Your application has been successfully submitted for the following position:
      </p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Position:</strong> ${job.role}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
        <p><strong>Employment Type:</strong> ${job.employmentType || "N/A"}</p>
        <p><strong>Experience Required:</strong> ${job.experience || "N/A"}</p>
        <p><strong>Experience Level:</strong> ${job.experienceLevel || "N/A"}</p>
        <p><strong>Salary:</strong> ${
          job.salary ? `₹${job.salary}` : "Not disclosed"
        }</p>
        <p><strong>Job Type:</strong> ${job.jobType || "N/A"}</p>
        <p><strong>Application Deadline:</strong> ${
          job.applicationDeadline
            ? new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not specified"
        }</p>
        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" },
        )}</p>
      </div>

      ${
        job.skills && job.skills.length
          ? `
      <div style="margin-bottom: 20px;">
        <h3 style="color:#2196F3; margin-bottom:5px;">Required Skills</h3>
        <p style="color:#555;">${job.skills.join(", ")}</p>
      </div>
      `
          : ""
      }

      ${
        job.clouds && job.clouds.length
          ? `
      <div style="margin-bottom: 20px;">
        <h3 style="color:#2196F3; margin-bottom:5px;">Required Clouds</h3>
        <p style="color:#555;">${job.clouds.join(", ")}</p>
      </div>
      `
          : ""
      }

      <div style="text-align:center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/job/${job.id}"
           style="
              display:inline-block;
              padding:12px 26px;
              background:#2196F3;
              color:#fff;
              text-decoration:none;
              font-weight:bold;
              border-radius:8px;
              font-size:14px;
           ">
           🔎 View Job Details
        </a>
      </div>
      <p style="color: #666;">
        The employer will review your application and contact you if your profile matches their requirements.
      </p>
      
      <p style="color: #666; margin-top: 20px;">Good luck! 🍀</p>
      
      <p style="color: #999; font-size: 14px; margin-top: 30px;">
        <em>This is an automated confirmation from the Job Portal.</em>
      </p>
    </div>
  </div>
`,
      });
    } catch (emailError) {
      console.error("Candidate email failed:", emailError.message);
    }
  } catch (error) {
    handleError(error);
    console.error("Background Processing Error:", error.message);
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
              companyLogo: true,
              experienceLevel: true,
              location: true,
              salary: true,
              employmentType: true,
              experience: true,
              skills: true,
              clouds: true,
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
      JSON.stringify(error.message, null, 2),
    );
    handleError(error, req, res);
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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};

function formatSavedJob(saved) {
  const deadlineDate = saved.job.applicationDeadline
    ? new Date(saved.job.applicationDeadline)
    : null;

  let daysUntilDeadline = null;
  let deadlineWarning = false;

  if (deadlineDate) {
    const today = new Date();
    daysUntilDeadline = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24),
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
                companyLogo: true,
                experienceLevel: true,
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
              experienceLevel: true,
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
    handleError(error, req, res);
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
      JSON.stringify(error.message, null, 2),
    );
    handleError(error, req, res);
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
        status: "Open", // 🔥 add this
        // 🚨 THIS LINE IS IMPORTANT
        ...(role === "company" ? { postedById: { not: userId } } : {}),
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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

// const postJob = async (req, res) => {
//   try {
//     const { id: recruiterId, organizationId, permission } = req.user;

//     if (!canCreate(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to post jobs",
//       });
//     }

//     const {
//       role,
//       description,
//       employmentType,
//       experience,
//       experienceLevel,
//       tenure,
//       location,
//       skills,
//       clouds,
//       salary,
//       companyName,
//       responsibilities,
//       certifications,
//       jobType,
//       applicationDeadline,
//       ApplicationLimit,
//       companyLogo,
//       questions, // 🆕 optional screening questions
//     } = req.body;

//     // Normalize tenure (unchanged)
//     let normalizedTenure = null;
//     if (["PartTime", "Contract", "Freelancer"].includes(employmentType)) {
//       const tenureNumber = tenure?.number;
//       if (
//         tenureNumber === undefined ||
//         tenureNumber === null ||
//         tenureNumber === ""
//       ) {
//         return res.status(400).json({
//           status: "error",
//           message: "Tenure is required for Part Time / Contract jobs",
//         });
//       }
//       normalizedTenure = {
//         number: String(tenureNumber),
//         type: tenure?.type || "month",
//       };
//     }

//     const job = await prisma.job.create({
//       data: {
//         role,
//         description,
//         employmentType,
//         experience,
//         experienceLevel,
//         location,
//         tenure: normalizedTenure,
//         skills,
//         clouds,
//         salary,
//         companyName,
//         responsibilities,
//         certifications,
//         jobType,
//         applicationDeadline,
//         ApplicationLimit,
//         companyLogo,
//         postedById: recruiterId,
//         organizationId,
//       },
//     });

//     // 🆕 INSERT SCREENING QUESTIONS if provided
//     if (Array.isArray(questions) && questions.length > 0) {
//       const questionData = questions
//         .filter((q) => q.question && q.question.trim() !== "")
//         .map((q, index) => ({
//           jobId: job.id,
//           question: q.question.trim(),
//           type: q.type || "TEXT",
//           options: Array.isArray(q.options) ? q.options : [],
//           required: q.required !== undefined ? q.required : true,
//           order: q.order !== undefined ? q.order : index,
//         }));

//       if (questionData.length > 0) {
//         await prisma.jobApplicationQuestion.createMany({ data: questionData });
//       }
//     }

//     logger.info(`Job posted successfully - jobId: ${job.id}`);

//     res.status(201).json({
//       status: "success",
//       message: "Job posted successfully",
//       job,
//     });

//     // Queue notification emails (unchanged)
//     (async () => {
//       try {
//         const recruiters = await prisma.users.findMany({
//           where: { role: "company" },
//           select: { email: true, id: true },
//         });

//         const candidates = await prisma.userProfile.findMany({
//           where: { isVerified: true },
//           select: { user: { select: { email: true, id: true } } },
//         });

//         const recruiterEmails = recruiters.map((r) => r.email);
//         const candidateEmails = candidates
//           .map((c) => c.user?.email)
//           .filter(Boolean);

//         if (!recruiterEmails.length && !candidateEmails.length) {
//           console.warn("No recipients found for job email");
//           return;
//         }

//         await queueJobEmails({ recruiterEmails, candidateEmails, job });
//       } catch (emailError) {
//         logger.error(
//           "Failed to queue job emails",
//           JSON.stringify(emailError.message, null, 2),
//         );
//       }
//     })();
//   } catch (error) {
//     logger.error("postJob Error:", JSON.stringify(error.message, null, 2));
//     return res.status(500).json({
//       status: "error",
//       error: error.message || "Internal server error",
//     });
//   }
// };

const postJob = async (req, res) => {
  console.log("post a new job");
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
      questions = [], // default empty array
    } = req.body;

    /* ─────────────────────────────
       1️⃣ NORMALIZE TENURE
    ───────────────────────────── */

    let normalizedTenure = null;

    if (["PartTime", "Contract", "Freelancer"].includes(employmentType)) {
      const tenureNumber = tenure?.number;

      if (!tenureNumber) {
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
        postedById: recruiterId,
        organizationId,
      },
    });

    /* ─────────────────────────────
       3️⃣ INSERT SCREENING QUESTIONS
    ───────────────────────────── */

    if (Array.isArray(questions) && questions.length > 0) {
      const questionData = questions
        .filter((q) => q?.question && q.question.trim() !== "")
        .map((q, index) => ({
          jobId: job.id,
          question: q.question.trim(),
          type: q.type || "TEXT",
          options: Array.isArray(q.options) ? q.options : [],
          required: q.required ?? true,
          order: q.order ?? index,
        }));

      if (questionData.length > 0) {
        const result = await prisma.jobApplicationQuestion.createMany({
          data: questionData,
        });

        console.log(
          `Inserted ${result.count} screening questions for job ${job.id}`,
        );
      }
    }

    console.log(`Job posted successfully - jobId: ${job.id}`);

    res.status(201).json({
      status: "success",
      message: "Job posted successfully",
      job,
    });

    (async () => {
      try {
        const recruiters = await prisma.users.findMany({
          where: { role: "company" },
          select: { email: true },
        });

        const candidates = await prisma.userProfile.findMany({
          where: { isVerified: true },
          select: {
            user: {
              select: { email: true },
            },
          },
        });

        const recruiterEmails = recruiters.map((r) => r.email);

        const candidateEmails = candidates
          .map((c) => c.user?.email)
          .filter(Boolean);

        if (!recruiterEmails.length && !candidateEmails.length) {
          console.log("No recipients found for job email notification");
          return;
        }

        await queueJobEmails({
          recruiterEmails,
          candidateEmails,
          job,
        });
      } catch (emailError) {
        console.log("Failed to queue job emails", emailError.message);
      }
    })();
  } catch (error) {
    console.error("postJob Error:", error.message);

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

const postedJobs = async (req, res) => {
  console.log("posted jobss");
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
      JSON.stringify(error.message, null, 2),
    );

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};

// Edit job posted by company or vendor
const editJob = async (req, res) => {
  console.log("edit job");
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
      questions = [],
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
        `Unauthorized job edit attempt - jobId: ${id}, userId: ${req.user.id} from ORGID: ${organizationId}`,
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

    /* ─────────────────────────────
       3️⃣ INSERT SCREENING QUESTIONS
    ───────────────────────────── */

    if (Array.isArray(questions) && questions.length > 0) {
      const questionData = questions
        .filter((q) => q?.question && q.question.trim() !== "")
        .map((q, index) => ({
          // jobId: job.id,
          jobId: id,
          question: q.question.trim(),
          type: q.type || "TEXT",
          options: Array.isArray(q.options) ? q.options : [],
          required: q.required ?? true,
          order: q.order ?? index,
        }));

      if (questionData.length > 0) {
        const result = await prisma.jobApplicationQuestion.createMany({
          data: questionData,
        });

        // console.log(
        //   `Inserted ${result.count} screening questions for job ${job.id}`,
        // );
        console.log(
          `Inserted ${result.count} screening questions for job ${id}`,
        );
      }
    }

    logger.info(`Job updated successfully - jobId: ${id}`);

    return res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    logger.error("editJob Error:", JSON.stringify(error.message, null, 2));
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to close job",
    });
  }
};

const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "jobId is required in params",
      });
    }

    const { id: userId, role, organizationId } = req.user || {};
    const isAuthenticated = !!req.user;

    // 🔥 Build dynamic include only if authenticated
    const include = {
      ...(isAuthenticated && {
        savedBy: {
          where: {
            isDeleted: false,
            ...(role === "candidate" ? { userId } : { organizationId }),
          },
          select: { id: true },
        },
      }),

      // 🔥 Include job questions
      _count: {
        select: { questions: true },
      },
    };

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      ...(include && { include }),
    });

    // Handle not found or soft deleted
    if (!job || job.isDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    const hasQuestions = job._count.questions > 0;
    // 🧠 Shape response intentionally
    const response = {
      ...job,
      isSaved: isAuthenticated ? job.savedBy.length > 0 : null,
      hasQuestions,
    };

    if (isAuthenticated) {
      delete response.savedBy;
    }

    return res.status(200).json({
      status: "success",
      job: response,
    });
  } catch (error) {
    logger.error("getJobDetails Error:", error);
    handleError(error, req, res);
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

    const applicants = await prisma.jobApplication.findMany({
      where: { jobId, status: { not: "Clear" } },
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
        // 🆕 INCLUDE SCREENING ANSWERS
        answers: {
          include: {
            question: {
              select: {
                question: true,
                type: true,
                order: true,
              },
            },
          },
          orderBy: {
            question: { order: "asc" },
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

    // Sort: highest fit score first, then newest application
    applicants.sort((a, b) => {
      const scoreA = a.analysis?.fitPercentage ?? -1;
      const scoreB = b.analysis?.fitPercentage ?? -1;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    });

    const formattedApplicants = applicants.map((app) => {
      const ratings = app.candidateProfile?.CandidateRating || [];
      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = ratings.length ? total / ratings.length : null;

      // 🆕 MAP SCREENING ANSWERS to readable format
      const screeningAnswers = (app.answers || []).map((a) => ({
        questionId: a.questionId,
        question: a.question.question,
        type: a.question.type,
        answer: a.answerText,
      }));

      return {
        applicationId: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        name: app.candidateProfile?.name,
        email: app.candidateProfile?.email,
        profile: app.candidateProfile,
        matchScore: app.analysis?.fitPercentage ?? null,
        aiAnalysis: app.analysis?.details ?? null,
        avgRating,
        ratingCount: ratings.length,
        ratingReviews: ratings,
        screeningAnswers, // 🆕
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
    handleError(error, req, res);
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
      `getUserAppliedJobsId Error: ${JSON.stringify(error.message, null, 2)}`,
    );
    handleError(error, req, res);
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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to save rating",
    });
  }
};

const getJobQuestions = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "jobId is required",
      });
    }

    const questions = await prisma.jobApplicationQuestion.findMany({
      where: { jobId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        type: true,
        options: true,
        required: true,
        order: true,
      },
    });

    return res.status(200).json({
      status: "success",
      data: questions,
    });
  } catch (error) {
    logger.error("getJobQuestions Error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error: " + error.message,
    });
  }
};
const bulkFitScore = async (req, res) => {
  try {
    const { jobId, candidateIds } = req.body;

    if (!jobId || !candidateIds?.length) {
      return res.status(400).json({
        status: "error",
        message: "jobId and candidateIds are required",
      });
    }

    // ✅ Fetch job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // ✅ Fetch candidates
    const candidates = await prisma.userProfile.findMany({
      where: {
        id: { in: candidateIds },
      },
    });

    const results = [];

    for (const candidate of candidates) {
      // 🔥 CHECK IF ALREADY EXISTS (VERY IMPORTANT)
      const existing = await prisma.candidateJobFit.findUnique({
        where: {
          jobId_candidateProfileId: {
            jobId,
            candidateProfileId: candidate.id,
          },
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      // ✅ Prepare AI data
      // const jobDescription = {
      //   role: job.role,
      //   description: job.description,
      //   skills: job.skills,
      //   clouds: job.clouds,
      // };

      // const candidateDetails = {
      //   skills: candidate.skillsJson || [],
      //   experience: candidate.totalExperience,
      //   location: candidate.currentLocation,
      // };

      const jobDescription = {
        // job_id: job.id,
        role: job.role,
        description: job.description || "",
        employmentType: job.employmentType,
        skills: job.skills || [],
        clouds: job.clouds || [],
        salary: job.salary,
        companyName: job.companyName,
        responsibilities: job.responsibilities || "",
        qualifications: job.certifications || [],
        experience: job.experience || "",
        experienceLevel: job.experienceLevel || "",
        location: job.location || "",
      };

      // ✅ 5️⃣ Build Candidate Details (From UserProfile)
      const candidateDetails = {
        // userId: profile.userId,
        title: candidate.title || "",
        // name: candidate.name || "",
        // phoneNumber: candidate.phoneNumber || "",
        // email: candidate.email || "",
        summary: candidate.summary || "",
        currentLocation: candidate.currentLocation || "",
        preferredLocation: candidate.preferredLocation || [],
        preferredJobType: candidate.preferredJobType || [],
        currentCTC: candidate.currentCTC || "",
        expectedCTC: candidate.expectedCTC || "",
        joiningPeriod: candidate.joiningPeriod || "",
        totalExperience: candidate.totalExperience || "",
        relevantSalesforceExperience:
          candidate.relevantSalesforceExperience || "",
        skills: candidate.skillsJson || [],
        primaryClouds: candidate.primaryClouds || [],
        secondaryClouds: candidate.secondaryClouds || [],
        certifications: candidate.certifications || [],
        workExperience: candidate.workExperience || [],
        education: candidate.education || [],
        // linkedInUrl: candidate.linkedInUrl,
        // trailheadUrl: candidate.trailheadUrl,
      };

      let fitPercentage = 0;
      let details = {};

      try {
        const aiResponse = await extractAIText("CV_RANKING", "cvranker", {
          jobDescription,
          candidateDetails,
        });

        if (aiResponse?.data) {
          fitPercentage = aiResponse.data.fit_percentage || 0;
          details = aiResponse.data;
        }
      } catch (err) {
        console.log("AI error:", err.message);
      }

      // ✅ SAVE IN NEW MODEL
      const fit = await prisma.candidateJobFit.create({
        data: {
          jobId,
          candidateProfileId: candidate.id,
          fitPercentage,
          details,
          status: "COMPLETED",
        },
      });

      results.push(fit);
    }

    return res.status(200).json({
      status: "success",
      message: "Bulk fit score generated",
      data: results,
    });
  } catch (error) {
    console.error("bulkFitScore error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate bulk fit score",
    });
  }
};
// 🔥 GET CANDIDATES WITH FIT SCORE
const getCandidatesWithFitScore = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "jobId is required",
      });
    }

    const fits = await prisma.candidateJobFit.findMany({
      where: { jobId },
      include: {
        candidateProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            title: true,
          },
        },
      },
      orderBy: {
        fitPercentage: "desc",
      },
    });

    return res.status(200).json({
      status: "success",
      data: fits,
    });
  } catch (error) {
    console.error("getCandidateFitScore error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch fit scores",
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
  getJobQuestions,
  bulkFitScore,
  getCandidatesWithFitScore,
};
