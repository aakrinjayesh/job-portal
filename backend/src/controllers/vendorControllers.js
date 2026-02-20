// controllers/vendorControllers.js
import prisma from "../config/prisma.js";
// import { extractResumeSections } from "../utils/llmTextExtractor.js";
import { extractAIText } from "../utils/ai/extractAI.js";
import { logger } from "../utils/logger.js";
import puppeteer from "puppeteer";
import { generateResumeHTML } from "../utils/resumeTemplate.js";
import sendEmail from "../utils/sendEmail.js";
// ✅ Get all candidates for a vendor
import { applyCandidateFilters } from "../utils/applyFilters.js";
import { canCreate, canDelete, canEdit } from "../utils/permission.js";

const getVendorCandidates = async (req, res) => {
  try {
    // 1️⃣ Take from params first
    const paramOrgId = req.params.organizationId;

    // 2️⃣ Fallback to logged-in user org
    const userOrgId = req.user?.organizationId;

    const organizationId = paramOrgId || userOrgId;

    if (!organizationId) {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can view candidates.",
      });
    }

    const candidates = await prisma.userProfile.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      message: "Vendor candidates fetched successfully.",
      data: candidates,
    });
  } catch (err) {
    console.error("Error fetching vendor candidates:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error fetching vendor candidates.",
    });
  }
};

// ✅ Create a new candidate for vendor
const createVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;
    const { organizationId, permission } = req.user;

    if (!organizationId || !permission) {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can create candidates.",
      });
    }

    if (!canCreate(permission)) {
      return res.status(403).json({
        status: "failed",
        message: "You do not have permission to create vendor candidates.",
      });
    }

    const data = req.body;

    const newCandidate = await prisma.userProfile.create({
      data: {
        vendorId: userAuth.id,
        organizationId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        title: data.title,
        summary: data.summary,
        portfolioLink: data.portfolioLink,
        preferredLocation: data.preferredLocation || [],
        currentLocation: data.currentLocation,
        preferredJobType: data.preferredJobType || [],
        currentCTC: data.currentCTC,
        expectedCTC: data.expectedCTC,
        rateCardPerHour: data.rateCardPerHour,
        joiningPeriod: data.joiningPeriod,
        totalExperience: data.totalExperience,
        relevantSalesforceExperience: data.relevantSalesforceExperience,
        skillsJson: data.skillsJson || [],
        primaryClouds: data.primaryClouds || [],
        secondaryClouds: data.secondaryClouds || [],
        certifications: data.certifications || [],
        workExperience: data.workExperience || [],
        education: data.education || [],
        linkedInUrl: data.linkedInUrl,
        trailheadUrl: data.trailheadUrl,
        profilePicture: data.profilePicture,
        // chatuserid: user.chatuserid,
        chatuserid: userAuth.chatuserid,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Candidate created successfully.",
      data: newCandidate,
    });
  } catch (err) {
    console.error("Error creating vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error creating vendor candidate.",
    });
  }
};

const updateVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;

    const { organizationId, permission } = req.user;

    if (!organizationId || !permission) {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can create candidates.",
      });
    }

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "failed",
        message:
          "You do not have permission to create or edit vendor candidates.",
      });
    }

    const { id, ...data } = req.body;

    const existingCandidate = await prisma.userProfile.findFirst({
      where: {
        id,
        vendorId: userAuth.id,
        organizationId,
      },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        status: "failed",
        message: "Candidate not found or not authorized to update.",
      });
    }

    // ⭐ Ignore undefined fields (very important)
    const safeData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    const updatedCandidate = await prisma.userProfile.update({
      where: { id },
      data: safeData,
    });

    return res.status(200).json({
      status: "success",
      message: "Candidate updated successfully.",
      data: updatedCandidate,
    });
  } catch (err) {
    console.error("Error updating vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error updating vendor candidate.",
    });
  }
};

// ✅ Delete vendor candidate (hard delete)
const deleteVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;
    const { id } = req.body;

    const { organizationId, permission } = req.user;

    if (!organizationId || !permission) {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can create candidates.",
      });
    }

    if (!canDelete(permission)) {
      return res.status(403).json({
        status: "failed",
        message: "You do not have permission to create vendor candidates.",
      });
    }

    const existingCandidate = await prisma.userProfile.findFirst({
      where: {
        id,
        // vendorId: organizationId,
        vendorId: userAuth.id, // ✅ correct
        organizationId,
      },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        status: "failed",
        message: "Candidate not found or not authorized to delete.",
      });
    }

    await prisma.userProfile.delete({ where: { id } });

    return res.status(200).json({
      status: "success",
      message: "Candidate deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error deleting vendor candidate.",
    });
  }
};

const updateCandidateStatus = async (req, res) => {
  try {
    const userAuth = req.user;
    // const { organizationId, permission } = req.user;

    if (!canEdit(userAuth.permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to edit jobs",
      });
    }

    const { jobApplicationId, status, candidateIds } = req.body;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Only recruiters can update status",
      });
    }

    /* ======================================================
       🟢 NEW FLOW: BENCH CANDIDATE ACTIVATE / DEACTIVATE
       ====================================================== */
    if (Array.isArray(candidateIds) && candidateIds.length > 0) {
      const allowedCandidateStatuses = ["active", "inactive"];

      if (!allowedCandidateStatuses.includes(status)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid candidate status",
        });
      }

      await prisma.userProfile.updateMany({
        where: {
          id: { in: candidateIds },
          organizationId: userAuth.organizationId,
        },
        data: { status },
      });

      return res.status(200).json({
        status: "success",
        message: "Candidate status updated successfully",
      });
    }

    /* ======================================================
       🔵 EXISTING FLOW: JOB APPLICATION STATUS (UNCHANGED)
       ====================================================== */

    if (!jobApplicationId || !status) {
      return res.status(400).json({
        status: "failed",
        message: "jobApplicationId and status required",
      });
    }

    // Manual options ONLY
    const allowedStatuses = ["Shortlisted", "Rejected", "Pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid status",
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: {
        job: { select: { organizationId: true } },
      },
    });

    if (!application) {
      return res.status(404).json({
        status: "failed",
        message: "Application not found",
      });
    }

    if (application.job.organizationId !== userAuth.organizationId) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status },
    });

    return res.status(200).json({
      status: "success",
      message: "Status updated",
      data: updated,
    });
  } catch (error) {
    console.error("updateCandidateStatus error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

//update this
const markCandidateReviewed = async (req, res) => {
  try {
    const userAuth = req.user;
    const { jobApplicationId } = req.body;

    if (userAuth.role !== "company") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!jobApplicationId) {
      return res.status(400).json({ message: "jobApplicationId is required" });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: {
        job: { select: { postedById: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.postedById !== userAuth.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only Pending → Reviewed
    if (application.status !== "Pending") {
      return res.status(200).json({
        status: "success",
        message: "Already reviewed or manually updated",
      });
    }

    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status: "Reviewed" },
    });

    return res.status(200).json({
      status: "success",
      message: "Candidate marked as Reviewed",
    });
  } catch (error) {
    console.error("markCandidateReviewed error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const userAuth = req.user;
    const savedCandidates = await prisma.savedCandidate.findMany({
      where: {
        organizationId: userAuth.organizationId,
      },
      select: {
        candidateProfileId: true,
      },
    });

    const savedCandidateIds = savedCandidates.map(
      (item) => item.candidateProfileId,
    );

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied",
      });
    }

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const filters = req.body.filters || {};

    // Step 1: Fetch ALL candidates
    const allCandidates = await prisma.userProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
        // user: {
        //   select: { id: true, name: true, email: true },
        // },
      },
    });

    // Step 2: Apply filters (in-memory)
    const filteredCandidates = applyCandidateFilters(allCandidates, filters);

    // Step 3: Pagination
    const totalCount = filteredCandidates?.length || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const paginatedCandidates = filteredCandidates.slice(skip, skip + limit);

    const candidatesWithVendorFlag = paginatedCandidates.map((candidate) => {
      const isVendor = !!candidate.vendor;
      const isSaved = savedCandidateIds.includes(candidate.id);
      return {
        ...candidate,
        isVendor,
        isSaved,
      };
    });

    return res.status(200).json({
      status: "success",
      candidates: candidatesWithVendorFlag,
      totalCount,
      savedCandidateIds,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("getAllCandidates Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

const getCandidateDetails = async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const { orgId, role: paramRole } = req?.params;
    const userAuth = req.user;

    const role = paramRole || userAuth?.role;
    const organizationId = orgId || userAuth?.organizationId;
    const id = paramId;

    // 1️⃣ Role check
    if (role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied",
      });
    }

    if (!id) {
      return res.status(400).json({
        status: "failed",
        message: "Candidate ID is required",
      });
    }

    // 2️⃣ Fetch candidate
    const candidate = await prisma.userProfile.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        CandidateRating: {
          select: {
            rating: true,
            comment: true,
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({
        status: "failed",
        message: "Candidate not found",
      });
    }

    // 3️⃣ Prepare rating data
    const ratingReviews = candidate.CandidateRating || [];

    const avgRating =
      ratingReviews.length > 0
        ? ratingReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          ratingReviews.length
        : 0;

    // 4️⃣ Check saved status
    const savedCandidate = await prisma.savedCandidate.findFirst({
      where: {
        organizationId: organizationId,
        candidateProfileId: id,
      },
      select: { id: true },
    });

    const isSaved = !!savedCandidate;
    const isVendor = !!candidate.vendorId;

    // 5️⃣ Mask contact details if vendor candidate
    let profile = { ...candidate };

    if (isVendor && candidate.vendor) {
      profile.email = candidate.vendor.email;
      profile.phoneNumber = candidate.vendor.phoneNumber;
    }

    // Remove raw rating relation from profile (since we send structured)
    delete profile.CandidateRating;

    return res.status(200).json({
      status: "success",
      candidate: {
        name: profile.name,
        email: profile.email,
        profile: {
          ...profile,
          isVendor,
          isSaved,
        },
        avgRating: Number(avgRating.toFixed(1)),
        ratingReviews,
      },
    });
  } catch (error) {
    console.error("getCandidateDetails Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// const vendorApplyCandidate = async (req, res) => {
//   try {
//     const vendorId = req.user.id;
//     const { organizationId, permission } = req.user;

//     if (!canEdit(permission)) {
//       return res.status(403).json({
//         status: "error",
//         message: "You are not allowed to edit jobs",
//       });
//     }

//     const vendor = req.user;
//     const { jobId, candidateProfileIds } = req.body;

//     const aiProcess = true;

//     if (!jobId || !candidateProfileIds?.length) {
//       return res.status(400).json({
//         status: "error",
//         message: "jobId and candidateProfileIds are required",
//       });
//     }

//     // 1️⃣ Validate Job
//     const job = await prisma.job.findFirst({
//       where: { id: jobId, isDeleted: false },
//       include: {
//         postedBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         _count: {
//           select: {
//             applications: true,
//           },
//         },
//       },
//     });

//     if (!job || job.status !== "Open") {
//       return res.status(400).json({
//         status: "error",
//         message: "Job closed or not found",
//       });
//     }

//     // if (job.organizationId !== organizationId && job.postedBy.id !== vendorId) {
//     //   return res.status(400).json({
//     //     status: "error",
//     //     message: "Unauthorized",
//     //   });
//     // }

//     const currentCount = job._count.applications;
//     const limit = job.ApplicationLimit;

//     let remainingSlots = Infinity;
//     if (limit !== null) {
//       remainingSlots = limit - currentCount;

//       if (remainingSlots <= 0) {
//         await prisma.job.update({
//           where: { id: jobId },
//           data: { status: "Closed" },
//         });

//         return res.status(400).json({
//           status: "error",
//           message: "Application limit reached. Job closed.",
//         });
//       }
//     }

//     // 2️⃣ Fetch vendor-owned profiles
//     const profiles = await prisma.userProfile.findMany({
//       where: {
//         id: { in: candidateProfileIds },
//         vendorId,
//       },
//     });

//     if (profiles.length !== candidateProfileIds.length) {
//       return res.status(403).json({
//         status: "failed",
//         message: "One or more profiles are not owned by this vendor",
//       });
//     }

//     // 3️⃣ Existing applications
//     const existingApps = await prisma.jobApplication.findMany({
//       where: {
//         jobId,
//         candidateProfileId: { in: candidateProfileIds },
//       },
//       select: { candidateProfileId: true },
//     });

//     const alreadyAppliedIds = new Set(
//       existingApps.map((a) => a.candidateProfileId),
//     );
//     let newProfiles = profiles.filter((p) => !alreadyAppliedIds.has(p.id));

//     if (limit !== null) {
//       newProfiles = newProfiles.slice(0, remainingSlots);
//     }

//     // 4️⃣ Prepare Job Description (only if AI is enabled)
//     let jobDescription = null;
//     if (aiProcess) {
//       jobDescription = {
//         job_id: job.id,
//         role: job.role,
//         description: job.description || "",
//         employmentType: job.employmentType || "FullTime",
//         skills: job.skills || [],
//         clouds: job.clouds || [],
//         salary: job.salary,
//         companyName: job.companyName,
//         responsibilities: job.responsibilities || [],
//         qualifications: job.qualifications || [],
//         experience: job.experience || "",
//         location: job.location || "",
//       };
//     }

//     // 5️⃣ Apply each candidate with conditional AI processing
//     const appliedCandidates = [];
//     const failedApplications = [];

//     for (const profile of newProfiles) {
//       let pdfBuffer = null; // Initialize pdfBuffer for each profile

//       try {
//         let aiAnalysisResult = null;

//         // 🔥 Only run AI if aiProcess is true
//         if (aiProcess) {
//           const candidateDetails = {
//             userId: profile.userId,
//             name: profile.name || "",
//             email: profile.email || "",
//             title: profile.title || "",
//             totalExperience: profile.totalExperience || "",
//             skills: profile.skillsJson || [],
//             primaryClouds: profile.primaryClouds || [],
//             secondaryClouds: profile.secondaryClouds || [],
//             certifications: profile.certifications || [],
//             workExperience: profile.workExperience || [],
//             education: profile.education || [],
//             linkedInUrl: profile.linkedInUrl || null,
//           };

//           try {
//             aiAnalysisResult = await extractAIText("CV_RANKING", "cvranker", {
//               jobDescription,
//               candidateDetails,
//             });
//           } catch (aiError) {
//             logger.error(
//               `AI Analysis failed for profile ${profile.id}:`,
//               aiError.message,
//             );
//             // Continue without AI analysis
//           }
//         }

//         // Transaction for this candidate
//         await prisma.$transaction(async (tx) => {
//           const count = await tx.jobApplication.count({ where: { jobId } });

//           if (limit !== null && count >= limit) {
//             await tx.job.update({
//               where: { id: jobId },
//               data: { status: "Closed" },
//             });
//             throw new Error("APPLICATION_LIMIT_REACHED");
//           }

//           // Create Application
//           const app = await tx.jobApplication.create({
//             data: {
//               jobId,
//               userId: vendorId,
//               candidateProfileId: profile.id,
//               appliedById: vendorId,
//               status: "Pending",
//             },
//           });

//           // B. Save AI Analysis only if aiProcess was enabled and analysis succeeded
//           if (aiProcess && aiAnalysisResult) {
//             await tx.applicationAnalysis.create({
//               data: {
//                 jobApplicationId: app.id,
//                 fitPercentage: aiAnalysisResult.fit_percentage || 0,
//                 details: aiAnalysisResult,
//                 status: "COMPLETED",
//               },
//             });
//           }
//         });

//         // Generate PDF Resume
//         try {
//           const resumeHTML = generateResumeHTML(
//             { name: profile.name, email: profile.email },
//             profile,
//             job,
//           );

//           const browser = await puppeteer.launch({
//             headless: "new",
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//           });

//           const page = await browser.newPage();
//           await page.setContent(resumeHTML, { waitUntil: "networkidle0" });

//           pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//             margin: {
//               top: "20px",
//               right: "20px",
//               bottom: "20px",
//               left: "20px",
//             },
//           });

//           await browser.close();
//         } catch (pdfErr) {
//           logger.error(
//             `PDF generation failed for profile ${profile.id}:`,
//             pdfErr.message,
//           );
//           // Continue without PDF
//         }

//         // Only add to success list after transaction succeeds
//         appliedCandidates.push({
//           candidateProfileId: profile.id,
//           candidateName: profile.name, // Fix: was missing this field
//           matchScore: aiProcess ? aiAnalysisResult?.fit_percentage || 0 : null,
//           pdfBuffer,
//           name: profile.name,
//         });
//       } catch (error) {
//         if (e.message === "APPLICATION_LIMIT_REACHED") break;
//         logger.error(`Failed to apply profile ${profile.id}:`, error.message);
//         failedApplications.push({
//           candidateProfileId: profile.id,
//           candidateName: profile.name,
//           error: error.message,
//         });
//       }
//     }

//     if (limit !== null && currentCount + appliedCandidates.length >= limit) {
//       await prisma.job.update({
//         where: { id: jobId },
//         data: { status: "Closed" },
//       });
//     }

//     // 6️⃣ Email to Recruiter (only if there are successful applications)
//     if (job.postedBy?.email && appliedCandidates.length > 0) {
//       try {
//         await sendEmail({
//           to: job.postedBy.email,
//           subject: `New Vendor Applications – ${job.role}`,
//           html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

//             <!-- HEADER -->
//             <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
//               <h1 style="margin: 0;">New Job Applications Received! 🎉</h1>
//             </div>

//             <!-- BODY -->
//             <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">

//               <h2 style="color: #333; margin-top: 0;">Vendor Submissions</h2>

//               <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//                 <p style="margin: 10px 0;"><strong>Job:</strong> ${job.role}</p>
//                 <p style="margin: 10px 0;"><strong>Total Candidates:</strong> ${
//                   appliedCandidates.length
//                 }</p>
//                 <p style="margin: 10px 0;"><strong>AI Ranking:</strong> ${
//                   aiProcess ? "Enabled" : "Disabled"
//                 }</p>
//               </div>

//               <!-- CANDIDATE LIST -->
//               <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//                 <h3 style="color: #667eea; margin-top: 0;">Submitted Candidates</h3>

//                 ${appliedCandidates
//                   .map(
//                     (c) => `
//                   <p style="margin: 8px 0;">
//                     <strong>${c.name}</strong>
//                     ${
//                       aiProcess ? ` – Fit Score: ${c.matchScore ?? "N/A"}%` : ""
//                     }
//                   </p>
//                 `,
//                   )
//                   .join("")}
//               </div>

//               <p style="color: #666; font-size: 14px; margin-top: 30px;">
//                 📎 Please find the detailed resumes attached to this email.
//               </p>

//               <p style="color: #666; font-size: 14px; margin-top: 20px;">
//                 <em>This is an automated notification from the Job Portal.</em>
//               </p>

//             </div>
//           </div>
//           `,
//           attachments: appliedCandidates
//             .filter((c) => c.pdfBuffer)
//             .map((c) => ({
//               filename: `${c.name.replace(/\s+/g, "_")}_Resume.pdf`,
//               content: c.pdfBuffer,
//               contentType: "application/pdf",
//             })),
//         });
//       } catch (e) {
//         logger.error("Recruiter email failed:", e.message);
//       }
//     }

//     // 7️⃣ Email to Vendor
//     if (vendor?.email) {
//       try {
//         await sendEmail({
//           to: vendor.email,
//           subject: `Application Submitted - ${job.role} at ${job.companyName}`,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//               <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
//                 <h1 style="margin: 0;">Application Submitted Successfully! ✅</h1>
//               </div>

//               <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
//                 <p style="color: #333; font-size: 16px;">Hi ${vendor.name},</p>

//                 <p style="color: #666;">Your application has been successfully submitted for the following position:</p>

//                 <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
//                   <p style="margin: 10px 0;"><strong>Position:</strong> ${
//                     job.role
//                   }</p>
//                   <p style="margin: 10px 0;"><strong>Company:</strong> ${
//                     job.companyName
//                   }</p>
//                   <p style="margin: 10px 0;"><strong>Location:</strong> ${
//                     job.location || "Not specified"
//                   }</p>
//                   <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString(
//                     "en-US",
//                     { year: "numeric", month: "long", day: "numeric" },
//                   )}</p>
//                   <p><strong>Total Candidates:</strong> ${
//                     appliedCandidates.length
//                   }</p>
//                   <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;"/>

//                   ${appliedCandidates
//                     .map(
//                       (c) => `
//                     <p style="margin: 5px 0;">• ${c.candidateName} ${
//                       aiProcess ? `(Match Score: ${c.matchScore}%)` : ""
//                     }</p>
//                   `,
//                     )
//                     .join("")}
//                 </div>

//                 <p style="color: #666;">The employer will review your application and get back to you if your profile matches their requirements.</p>

//                 <p style="color: #666; margin-top: 20px;">Good luck! 🍀</p>

//                 <p style="color: #999; font-size: 14px; margin-top: 30px;">
//                   <em>This is an automated confirmation from the Job Portal.</em>
//                 </p>
//               </div>
//             </div>
//           `,
//         });
//       } catch (emailError) {
//         logger.error("Error sending confirmation email:", emailError.message);
//       }
//     }

//     // Remove pdfBuffer from response to reduce payload size
//     appliedCandidates.forEach((c) => delete c.pdfBuffer);

//     return res.status(201).json({
//       status: "success",
//       message: "Vendor applications processed successfully",
//       appliedCount: appliedCandidates.length,
//       skippedAlreadyApplied: alreadyAppliedIds.size,
//       aiProcessEnabled: aiProcess,
//       appliedCandidates,
//       alreadyAppliedCandidates: [...alreadyAppliedIds],
//       ...(failedApplications.length > 0 && { failedApplications }),
//     });
//   } catch (error) {
//     console.error("🔥🔥🔥 Vendor Apply FULL ERROR 🔥🔥🔥");

//     return res.status(500).json({
//       status: "failed",
//       message: error?.message || "Vendor Apply failed",
//     });
//   }
// };

const vendorApplyCandidate = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { organizationId, permission } = req.user;

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to edit jobs",
      });
    }

    const vendor = req.user;
    const { jobId, candidateProfileIds } = req.body;

    if (!jobId || !candidateProfileIds?.length) {
      return res.status(400).json({
        status: "error",
        message: "jobId and candidateProfileIds are required",
      });
    }

    /* ─────────────────────────────
       1️⃣ VALIDATE JOB
    ───────────────────────────── */
    const job = await prisma.job.findFirst({
      where: { id: jobId, isDeleted: false },
      include: {
        postedBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job || job.status !== "Open") {
      return res.status(400).json({
        status: "error",
        message: "Job closed or not found",
      });
    }

    const currentCount = job._count.applications;
    const limit = job.ApplicationLimit;

    let remainingSlots = Infinity;
    if (limit !== null) {
      remainingSlots = limit - currentCount;

      if (remainingSlots <= 0) {
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "Closed" },
        });

        return res.status(400).json({
          status: "error",
          message: "Application limit reached. Job closed.",
        });
      }
    }

    /* ─────────────────────────────
       2️⃣ FETCH VENDOR-OWNED PROFILES
    ───────────────────────────── */
    const profiles = await prisma.userProfile.findMany({
      where: {
        id: { in: candidateProfileIds },
        vendorId,
      },
    });

    if (profiles.length !== candidateProfileIds.length) {
      return res.status(403).json({
        status: "failed",
        message: "One or more profiles are not owned by this vendor",
      });
    }

    /* ─────────────────────────────
       3️⃣ FILTER DUPLICATES
    ───────────────────────────── */
    const existingApps = await prisma.jobApplication.findMany({
      where: {
        jobId,
        candidateProfileId: { in: candidateProfileIds },
      },
      select: { candidateProfileId: true },
    });

    const alreadyAppliedIds = new Set(
      existingApps.map((a) => a.candidateProfileId),
    );

    // Build skipped list with full details for a useful response
    const skippedCandidates = profiles
      .filter((p) => alreadyAppliedIds.has(p.id))
      .map((p) => ({
        candidateProfileId: p.id,
        candidateName: p.name,
        email: p.email,
      }));

    let newProfiles = profiles.filter((p) => !alreadyAppliedIds.has(p.id));

    // Respect remaining slot count — slice to prevent overflow
    if (limit !== null) {
      newProfiles = newProfiles.slice(0, remainingSlots);
    }

    /* ─────────────────────────────
       4️⃣ CHECK RECRUITER LICENSE FOR AI
    ───────────────────────────── */
    let aiAllowed = false;
    let recruiterLicense = null;
    let limitConfigs = [];

    if (job.postedById) {
      const recruiterMember = await prisma.organizationMember.findUnique({
        where: { userId: job.postedById },
        include: {
          license: {
            include: {
              plan: { include: { limits: true } },
            },
          },
        },
      });

      recruiterLicense = recruiterMember?.license;

      if (recruiterLicense && recruiterLicense.isActive) {
        limitConfigs = recruiterLicense.plan.limits.filter(
          (l) => l.feature === "FIT_SCORE_ANALYSES",
        );

        aiAllowed = true;

        for (const limit of limitConfigs) {
          if (limit.period === "DAILY") {
            continue;
          }

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
                licenseId: recruiterLicense.id,
                feature: "FIT_SCORE_ANALYSES",
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

    /* ─────────────────────────────
       5️⃣ PREPARE JOB DESCRIPTION (reused across all candidates)
    ───────────────────────────── */
    const jobDescription = aiAllowed
      ? {
          job_id: job.id,
          role: job.role,
          description: job.description || "",
          employmentType: job.employmentType || "FullTime",
          skills: job.skills || [],
          clouds: job.clouds || [],
          salary: job.salary,
          companyName: job.companyName,
          responsibilities: job.responsibilities || [],
          qualifications: job.qualifications || [],
          experience: job.experience || "",
          location: job.location || "",
        }
      : null;

    /* ─────────────────────────────
       6️⃣ PROCESS EACH CANDIDATE
    ───────────────────────────── */
    const appliedCandidates = [];
    const failedApplications = [];
    let limitReached = false;

    for (const profile of newProfiles) {
      if (limitReached) break;

      let pdfBuffer = null;

      try {
        /* ── A. AI Analysis ── */
        let aiAnalysisResult = null;

        if (aiAllowed) {
          const candidateDetails = {
            userId: profile.userId,
            name: profile.name || "",
            email: profile.email || "",
            title: profile.title || "",
            totalExperience: profile.totalExperience || "",
            skills: profile.skillsJson || [],
            primaryClouds: profile.primaryClouds || [],
            secondaryClouds: profile.secondaryClouds || [],
            certifications: profile.certifications || [],
            workExperience: profile.workExperience || [],
            education: profile.education || [],
            linkedInUrl: profile.linkedInUrl || null,
          };

          try {
            const aiResponse = await extractAIText("CV_RANKING", "cvranker", {
              jobDescription,
              candidateDetails,
            });

            if (aiResponse?.data) {
              aiAnalysisResult = aiResponse.data;
            }
          } catch (aiError) {
            logger.error(
              `AI Analysis failed for profile ${profile.id}:`,
              aiError.message,
            );
            // Continue without AI — do NOT deduct usage on failure
          }
        }

        /* ── B. Transaction: Create Application + Save AI + Track Usage ── */
        await prisma.$transaction(async (tx) => {
          const count = await tx.jobApplication.count({ where: { jobId } });

          if (limit !== null && count >= limit) {
            await tx.job.update({
              where: { id: jobId },
              data: { status: "Closed" },
            });
            throw new Error("APPLICATION_LIMIT_REACHED");
          }

          const app = await tx.jobApplication.create({
            data: {
              jobId,
              userId: vendorId,
              candidateProfileId: profile.id,
              appliedById: vendorId,
              status: "Pending",
            },
          });

          // Save AI analysis if it succeeded
          if (aiAllowed && aiAnalysisResult) {
            await tx.applicationAnalysis.create({
              data: {
                jobApplicationId: app.id,
                fitPercentage: aiAnalysisResult.fit_percentage || 0,
                details: aiAnalysisResult,
                status: "COMPLETED",
              },
            });

            const now = new Date();

            for (const lim of limitConfigs) {
              let periodStart, periodEnd;

              if (lim.period === "DAILY") {
                periodStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  0,
                  0,
                  0,
                  0,
                );
                periodEnd = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  23,
                  59,
                  59,
                  999,
                );
              } else if (lim.period === "MONTHLY") {
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              } else if (lim.period === "YEARLY") {
                periodStart = new Date(now.getFullYear(), 0, 1);
                periodEnd = new Date(now.getFullYear(), 11, 31);
              }

              await tx.usageRecord.upsert({
                where: {
                  licenseId_feature_period_periodStart: {
                    licenseId: recruiterLicense.id,
                    feature: "FIT_SCORE_ANALYSES",
                    period: lim.period,
                    periodStart,
                  },
                },
                update: {
                  currentUsage: { increment: 1 },
                },
                create: {
                  licenseId: recruiterLicense.id,
                  feature: "FIT_SCORE_ANALYSES",
                  period: lim.period,
                  currentUsage: 1,
                  periodStart,
                  periodEnd,
                },
              });
            }

            // 🔥 NEW — Insert token usage
            await tx.aITokenUsage.create({
              data: {
                organizationId: organizationId,
                userId: job.postedById, // recruiter who owns license
                licenseId: recruiterLicense.id,
                inputTokens: tokenUsage?.prompt || 0,
                outputTokens: tokenUsage?.completion || 0,
                totalTokens: tokenUsage?.total || 0,
                featureUsed: "FIT_SCORE_ANALYSES",
              },
            });
          }
        });

        /* ── C. PDF Generation ── */
        try {
          const resumeHTML = generateResumeHTML(
            { name: profile.name, email: profile.email },
            profile,
            job,
          );

          const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });

          const page = await browser.newPage();
          await page.setContent(resumeHTML, { waitUntil: "networkidle0" });

          pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
              top: "20px",
              right: "20px",
              bottom: "20px",
              left: "20px",
            },
          });

          await browser.close();
        } catch (pdfErr) {
          logger.error(
            `PDF generation failed for profile ${profile.id}:`,
            pdfErr.message,
          );
          // Continue without PDF
        }

        appliedCandidates.push({
          candidateProfileId: profile.id,
          candidateName: profile.name,
          email: profile.email,
          matchScore: aiAllowed
            ? (aiAnalysisResult?.fit_percentage ?? null)
            : null,
          pdfBuffer,
        });
      } catch (error) {
        // ✅ Fixed: was incorrectly referencing undefined 'e' instead of 'error'
        if (error.message === "APPLICATION_LIMIT_REACHED") {
          limitReached = true;
          break;
        }
        logger.error(`Failed to apply profile ${profile.id}:`, error.message);
        failedApplications.push({
          candidateProfileId: profile.id,
          candidateName: profile.name,
          email: profile.email,
          error: error.message,
        });
      }
    }

    /* ─────────────────────────────
       7️⃣ CLOSE JOB IF LIMIT NOW REACHED
    ───────────────────────────── */
    if (limit !== null && currentCount + appliedCandidates.length >= limit) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "Closed" },
      });
    }

    /* ─────────────────────────────
       8️⃣ EMAIL TO RECRUITER
    ───────────────────────────── */
    if (job.postedBy?.email && appliedCandidates.length > 0) {
      try {
        await sendEmail({
          to: job.postedBy.email,
          subject: `New Vendor Applications – ${job.role}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">New Job Applications Received! 🎉</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Vendor Submissions</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 10px 0;"><strong>Job:</strong> ${job.role}</p>
                  <p style="margin: 10px 0;"><strong>Company:</strong> ${job.companyName}</p>
                  <p style="margin: 10px 0;"><strong>Total Candidates:</strong> ${appliedCandidates.length}</p>
                  <p style="margin: 10px 0;"><strong>AI Ranking:</strong> ${aiAllowed ? "Enabled" : "Disabled"}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #667eea; margin-top: 0;">Submitted Candidates</h3>
                  ${appliedCandidates
                    .map(
                      (c) => `
                      <p style="margin: 8px 0;">
                        <strong>${c.candidateName}</strong>
                        ${aiAllowed ? ` – Fit Score: ${c.matchScore ?? "N/A"}%` : ""}
                      </p>
                    `,
                    )
                    .join("")}
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  📎 Please find the detailed resumes attached to this email.
                </p>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  <em>This is an automated notification from the Job Portal.</em>
                </p>
              </div>
            </div>
          `,
          attachments: appliedCandidates
            .filter((c) => c.pdfBuffer)
            .map((c) => ({
              filename: `${c.candidateName.replace(/\s+/g, "_")}_Resume.pdf`,
              content: c.pdfBuffer,
              contentType: "application/pdf",
            })),
        });
      } catch (emailError) {
        logger.error("Recruiter email failed:", emailError.message);
      }
    }

    /* ─────────────────────────────
       9️⃣ EMAIL TO VENDOR
    ───────────────────────────── */
    if (vendor?.email) {
      try {
        await sendEmail({
          to: vendor.email,
          subject: `Application Submitted - ${job.role} at ${job.companyName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">Application Submitted Successfully! ✅</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 16px;">Hi ${vendor.name},</p>
                <p style="color: #666;">Your applications have been successfully submitted for the following position:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 10px 0;"><strong>Position:</strong> ${job.role}</p>
                  <p style="margin: 10px 0;"><strong>Company:</strong> ${job.companyName}</p>
                  <p style="margin: 10px 0;"><strong>Location:</strong> ${job.location || "Not specified"}</p>
                  <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <p style="margin: 10px 0;"><strong>Total Candidates Submitted:</strong> ${appliedCandidates.length}</p>
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;" />
                  ${appliedCandidates
                    .map(
                      (c) => `
                      <p style="margin: 5px 0;">
                        • <strong>${c.candidateName}</strong>
                        ${aiAllowed ? ` (Match Score: ${c.matchScore ?? "N/A"}%)` : ""}
                      </p>
                    `,
                    )
                    .join("")}
                </div>
                <p style="color: #666;">The employer will review the applications and get back to you if profiles match their requirements.</p>
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
          "Error sending confirmation email to vendor:",
          emailError.message,
        );
      }
    }

    /* ─────────────────────────────
       RESPONSE — strip pdfBuffers before sending
    ───────────────────────────── */
    const responseApplied = appliedCandidates.map(
      ({ pdfBuffer, ...rest }) => rest,
    );

    return res.status(201).json({
      status: "success",
      message: "Vendor applications processed successfully",
      appliedCount: appliedCandidates.length,
      skippedAlreadyApplied: skippedCandidates.length,
      aiProcessEnabled: aiAllowed,
      appliedCandidates: responseApplied,
      skippedCandidates,
      ...(failedApplications.length > 0 && { failedApplications }),
    });
  } catch (error) {
    logger.error("Vendor Apply Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: error?.message || "Vendor Apply failed",
    });
  }
};

const saveCandidate = async (req, res) => {
  try {
    const { organizationId, permission, id: recruiterId } = req.user;

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to edit jobs",
      });
    }

    const { candidateProfileId } = req.body;

    // Validate logged-in user
    const user = await prisma.users.findFirst({
      where: { id: recruiterId },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid recruiter user",
      });
    }

    // Validate candidate
    const candidate = await prisma.userProfile.findUnique({
      where: { id: candidateProfileId },
    });

    if (!candidate) {
      return res.status(404).json({
        status: "error",
        message: "Candidate not found",
      });
    }

    // Prevent duplicate save
    const existingSave = await prisma.savedCandidate.findFirst({
      where: {
        recruiterId: recruiterId,
        organizationId,
        candidateProfileId,
      },
    });

    if (existingSave) {
      return res.status(409).json({
        status: "error",
        message: "Candidate already saved",
      });
    }

    // Save candidate
    const savedCandidate = await prisma.savedCandidate.create({
      data: {
        recruiterId,
        organizationId,
        candidateProfileId,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Candidate saved successfully",
      data: savedCandidate,
    });
  } catch (error) {
    console.error("saveCandidate error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const unsaveCandidate = async (req, res) => {
  try {
    const { organizationId, permission } = req.user;

    if (!canEdit(permission)) {
      return res.status(403).json({
        status: "error",
        message: "You are not allowed to edit jobs",
      });
    }

    const { candidateProfileId } = req.body;
    const recruiterId = req.user.id;

    if (!candidateProfileId) {
      return res.status(400).json({
        status: "error",
        message: "Candidate profile ID is required",
      });
    }

    const deleted = await prisma.savedCandidate.deleteMany({
      where: {
        recruiterId,
        organizationId,
        candidateProfileId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        status: "error",
        message: "Saved candidate not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Candidate removed from saved list",
    });
  } catch (error) {
    logger.error("unsaveCandidate Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to unsave candidate",
    });
  }
};

const getSavedCandidates = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [savedCandidates, total] = await Promise.all([
      prisma.savedCandidate.findMany({
        where: { organizationId },
        include: {
          candidateProfile: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.savedCandidate.count({ where: { organizationId } }),
    ]);

    console.log("candates", savedCandidates);

    const formatted = savedCandidates.map((item) => ({
      ...item.candidateProfile,
      isSaved: true,
      savedAt: item.createdAt,
    }));

    console.log("candidate formatte", formatted);

    return res.status(200).json({
      status: "success",
      data: {
        savedCandidates: formatted,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getSavedCandidates Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch saved candidates" + error.message,
    });
  }
};

const markCandidateBookmark = async (req, res) => {
  try {
    const userAuth = req.user;
    const { jobApplicationId } = req.body;

    if (userAuth.role !== "company") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!jobApplicationId) {
      return res.status(400).json({ message: "jobApplicationId is required" });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: {
        job: { select: { postedById: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.postedById !== userAuth.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status: "BookMark" },
    });

    return res.status(200).json({
      status: "success",
      message: "Candidate marked as Bookmark",
    });
  } catch (error) {
    console.error("markCandidateBookmark error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getVendorCandidates,
  createVendorCandidate,
  updateVendorCandidate,
  deleteVendorCandidate,
  updateCandidateStatus,
  getAllCandidates,
  vendorApplyCandidate,
  saveCandidate,
  unsaveCandidate,
  getSavedCandidates,
  markCandidateReviewed,
  getCandidateDetails,
  markCandidateBookmark,
};
