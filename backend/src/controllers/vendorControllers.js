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
import { handleError } from "../utils/handleError.js";

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
    handleError(err, req, res);
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
        // status: data.status || "ACTIVE",
        status: data.status || "active",
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Candidate created successfully.",
      data: newCandidate,
    });
  } catch (err) {
    console.error("Error creating vendor candidate:", err);
    handleError(err, req, res);
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
    handleError(err, req, res);
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
    handleError(err, req, res);
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
      // const allowedCandidateStatuses = ["ACTIVE", "INACTIVE"];

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
    handleError(error, req, res);
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
    handleError(error, req, res);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const userAuth = req.user;
    const recruiterDomain = userAuth.email.split("@")[1].toLowerCase();
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
      where: {
        status: "active",

        AND: [
          {
            NOT: {
              hiddenDomains: {
                has: recruiterDomain,
              },
            },
          },
        ],
      },
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
    handleError(error, req, res);
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
            organizationMember: {
              select: {
                organization: {
                  select: {
                    companyProfile: {
                      select: { slug: true },
                    },
                  },
                },
              },
            },
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
        role: role, // ✅ ADD THIS
        organizationId: organizationId, // ✅ ADD THIS
        id: id, // ✅ ADD THIS (candidate id)
        profile: {
          ...profile,
          isVendor,
          isSaved,
          companyProfileSlug:
            candidate.vendor?.organizationMember?.organization?.companyProfile
              ?.slug || null,
        },
        avgRating: Number(avgRating.toFixed(1)),
        ratingReviews,
      },
    });
  } catch (error) {
    console.error("getCandidateDetails Error:", error);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

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

    // answers: vendor fills once — same answers spread to every candidate application
    const { jobId, candidateProfileIds, answers = [] } = req.body;

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
        organizationId,
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
    // const existingApps = await prisma.jobApplication.findMany({
    //   where: {
    //     jobId,
    //     candidateProfileId: { in: candidateProfileIds },
    //   },
    //   select: { candidateProfileId: true },
    // });

    // const alreadyAppliedIds = new Set(
    //   existingApps.map((a) => a.candidateProfileId),
    // );
    const existingApps = await prisma.jobApplication.findMany({
      where: {
        jobId,
        candidateProfileId: { in: candidateProfileIds },
        status: { not: "Clear" }, // exclude fit-score-only records
      },
      select: { candidateProfileId: true, id: true },
    });

    const alreadyAppliedIds = new Set(
      existingApps.map((a) => a.candidateProfileId),
    );

    // Upgrade any "Clear" records to "Pending" so fit score is preserved
    const clearApps = await prisma.jobApplication.findMany({
      where: {
        jobId,
        candidateProfileId: { in: candidateProfileIds },
        status: "Clear",
      },
      select: { id: true },
    });

    if (clearApps.length > 0) {
      await prisma.jobApplication.updateMany({
        where: { id: { in: clearApps.map((a) => a.id) } },
        data: { status: "Pending" },
      });
    }

    const skippedCandidates = profiles
      .filter((p) => alreadyAppliedIds.has(p.id))
      .map((p) => ({
        candidateProfileId: p.id,
        candidateName: p.name,
        email: p.email,
      }));

    let newProfiles = profiles.filter((p) => !alreadyAppliedIds.has(p.id));

    if (limit !== null) {
      newProfiles = newProfiles.slice(0, remainingSlots);
    }

    /* ─────────────────────────────
       4️⃣ VALIDATE SCREENING ANSWERS (once, before touching the DB)
          Vendor answers once for all candidates — validate upfront so we
          don't create partial applications if a required answer is missing.
    ───────────────────────────── */
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

    /* ─────────────────────────────
       5️⃣ CHECK RECRUITER LICENSE FOR AI
    ───────────────────────────── */
    let aiAllowed = false;
    let recruiterLicense = null;
    let recruiterSeatId = null;
    let limitConfigs = [];

    if (job.postedById) {
      const recruiterMember = await prisma.organizationMember.findUnique({
        where: { userId: job.postedById },
      });

      if (recruiterMember) {
        recruiterLicense = await prisma.license.findFirst({
          where: {
            assignedToId: recruiterMember.id,
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() },
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

        for (const lim of limitConfigs) {
          if (lim.period === "DAILY") continue;

          const now = new Date();
          let periodStart;

          if (lim.period === "MONTHLY") {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          } else if (lim.period === "YEARLY") {
            periodStart = new Date(now.getFullYear(), 0, 1);
          }

          const usage = await prisma.usageRecord.findUnique({
            where: {
              licenseId_feature_period_periodStart: {
                licenseId: recruiterLicense.id,
                feature: "AI_FIT_SCORE",
                period: lim.period,
                periodStart,
              },
            },
          });

          if (usage && usage.currentUsage >= lim.maxAllowed) {
            aiAllowed = false;
            break;
          }
        }
      }
    }

    /* ─────────────────────────────
       6️⃣ CREATE APPLICATIONS IN DB
          One transaction per candidate — same answers written to every application.
          Field name matches userApplyJob: applicationId (not jobApplicationId)
    ───────────────────────────── */
    const appliedCandidates = [];
    const failedApplications = [];
    let limitReached = false;

    for (const profile of newProfiles) {
      if (limitReached) break;

      try {
        const app = await prisma.$transaction(async (tx) => {
          const count = await tx.jobApplication.count({ where: { jobId } });

          if (limit !== null && count >= limit) {
            await tx.job.update({
              where: { id: jobId },
              data: { status: "Closed" },
            });
            throw new Error("APPLICATION_LIMIT_REACHED");
          }

          const newApp = await tx.jobApplication.create({
            data: {
              jobId,
              userId: vendorId,
              candidateProfileId: profile.id,
              appliedById: vendorId,
              status: "Pending",
            },
          });

          // Spread the shared vendor answers to this candidate's application
          if (answers.length > 0) {
            await tx.jobApplicationAnswer.createMany({
              data: answers.map((a) => ({
                applicationId: newApp.id, // ← matches userApplyJob schema
                questionId: a.questionId,
                answerText: String(a.answerText ?? ""),
              })),
            });
          }

          return newApp;
        });

        appliedCandidates.push({
          applicationId: app.id,
          candidateProfileId: profile.id,
          candidateName: profile.name,
          email: profile.email,
        });
      } catch (error) {
        if (error.message === "APPLICATION_LIMIT_REACHED") {
          limitReached = true;
          break;
        }
        logger.error(
          `Failed to create application for profile ${profile.id}:`,
          error.message,
        );
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
       8️⃣ EMAIL TO VENDOR
    ───────────────────────────── */
    if (vendor?.email && appliedCandidates.length > 0) {
      sendEmail({
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
                <p style="margin: 10px 0;"><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
                <p style="margin: 10px 0;"><strong>Experience Required:</strong> ${job.experience || "Not specified"}</p>
                <p style="margin: 10px 0;"><strong>Salary:</strong> ${job.salary || "Not disclosed"}</p>
                <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p style="margin: 10px 0;"><strong>Total Candidates Submitted:</strong> ${appliedCandidates.length}</p>
                ${job.skills?.length ? `<p style="margin: 10px 0;"><strong>Required Skills:</strong> ${job.skills.join(", ")}</p>` : ""}
                ${job.clouds?.length ? `<p style="margin: 10px 0;"><strong>Required Clouds:</strong> ${job.clouds.join(", ")}</p>` : ""}
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;" />
                <p style="margin: 10px 0 8px 0; font-size: 15px; font-weight: 800; color: #111;">
  Submitted Candidates:
</p>
                ${appliedCandidates.map((c) => `<p style="margin: 5px 0; color: #333; font-size: 14px;">• ${c.candidateName}</p>`).join("")}
              </div>
              <p style="color: #666;">The employer will review the applications and get back to you if profiles match their requirements.</p>
              <p style="color: #666; margin-top: 20px;">Good luck! 🍀</p>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                <em>This is an automated confirmation from the Job Portal.</em>
              </p>
            </div>
          </div>
        `,
      }).catch((emailError) => {
        logger.error(
          "Error sending confirmation email to vendor:",
          emailError.message,
        );
      });
    }

    /* ─────────────────────────────
       9️⃣ SEND RESPONSE IMMEDIATELY
    ───────────────────────────── */
    res.status(201).json({
      status: "success",
      message: `Vendor application${appliedCandidates.length > 1 ? "s" : ""} processed successfully`,
      appliedCount: appliedCandidates.length,
      skippedAlreadyApplied: skippedCandidates.length,
      aiProcessEnabled: aiAllowed,
      appliedCandidates: appliedCandidates.map(
        ({ applicationId, ...rest }) => rest,
      ),
      skippedCandidates,
      ...(failedApplications.length > 0 && { failedApplications }),
    });

    // ✅ FIX — renamed to remainingScoreSlots to avoid conflict
    const alreadyScoredCount = await prisma.applicationAnalysis.count({
      where: {
        jobApplication: { jobId },
      },
    });

    const remainingScoreSlots = 5 - alreadyScoredCount;

    if (appliedCandidates.length > 0 && remainingScoreSlots > 0) {
      processInBackground({
        appliedCandidates: appliedCandidates.slice(0, remainingScoreSlots),
        job,
        aiAllowed,
        recruiterLicense,
        recruiterSeatId,
        limitConfigs,
        organizationId,
        newProfiles,
      });
    }
  } catch (error) {
    logger.error("Vendor Apply Error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "failed",
      message: error?.message || "Vendor Apply failed",
    });
  }
};

const processInBackground = async ({
  appliedCandidates,
  job,
  aiAllowed,
  recruiterLicense,
  recruiterSeatId,
  limitConfigs,
  organizationId,
  newProfiles,
}) => {
  // Build a quick lookup: profileId → profile object
  const profileMap = new Map(newProfiles.map((p) => [p.id, p]));

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

  // Will accumulate results for the recruiter email at the end
  const processedCandidates = [];

  /* ── Per-candidate: AI analysis (sequential to respect license limits safely) ── */
  for (const candidate of appliedCandidates) {
    const profile = profileMap.get(candidate.candidateProfileId);
    if (!profile) continue;

    let aiAnalysisResult = null;
    let tokenUsage = null;

    /* ── A. AI Analysis ── */
    if (aiAllowed) {
      try {
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

        const aiResponse = await extractAIText("CV_RANKING", "cvranker", {
          jobDescription,
          candidateDetails,
        });

        if (aiResponse?.data) {
          aiAnalysisResult = aiResponse.data;
          tokenUsage = aiResponse.tokenUsage ?? null;
        }
      } catch (aiError) {
        logger.error(
          `[Background] AI analysis failed for profile ${profile.id}:`,
          aiError.message,
        );
        // Continue without AI score — application already created in DB
      }
    }

    /* ── B. Save AI result + update usage in DB ── */
    if (aiAllowed && aiAnalysisResult) {
      try {
        const now = new Date();

        await prisma.$transaction(async (tx) => {
          await tx.applicationAnalysis.create({
            data: {
              jobApplicationId: candidate.applicationId,
              fitPercentage: aiAnalysisResult.fit_percentage || 0,
              details: aiAnalysisResult,
              status: "COMPLETED",
            },
          });

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
                  feature: "AI_FIT_SCORE",
                  period: lim.period,
                  periodStart,
                },
              },
              update: {
                currentUsage: { increment: 1 },
              },
              create: {
                licenseId: recruiterLicense.id,
                seatId: recruiterSeatId, // keep if neededs
                feature: "AI_FIT_SCORE",
                period: lim.period,
                currentUsage: 1,
                periodStart,
                periodEnd,
              },
            });
          }

          await tx.aITokenUsage.create({
            data: {
              organizationId,
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
      } catch (dbError) {
        logger.error(
          `[Background] Failed to save AI result for profile ${profile.id}:`,
          dbError.message,
        );
      }
    }

    processedCandidates.push({
      candidateName: profile.name,
      email: profile.email,
      matchScore: aiAnalysisResult?.fit_percentage ?? null,
      profile, // needed for PDF generation
    });
  }

  if (job.postedBy?.email) {
    try {
      await sendEmail({
        to: job.postedBy.email,
        subject: `New Vendor Applications – ${job.role}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">

        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">New Applications Received 🎉</h1>
          <p style="margin-top: 6px; font-size: 15px;">
            ${job.role} at ${job.companyName}
          </p>
        </div>

        <!-- BODY -->
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">

          <!-- JOB DETAILS -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Position:</strong> ${job.role}</p>
            <p><strong>Company:</strong> ${job.companyName}</p>
            <p><strong>Location:</strong> ${job.location || "Not specified"}</p>
            <p><strong>Employment Type:</strong> ${job.employmentType || "Not specified"}</p>
            <p><strong>Experience Level:</strong> ${job.experienceLevel || "Not specified"}</p>
            <p><strong>Job Type:</strong> ${job.jobType || "Not specified"}</p>
            <p><strong>Salary:</strong> ${
              job.salary ? `₹ ${job.salary}` : "Not disclosed"
            }</p>
            <p><strong>Application Deadline:</strong> ${
              job.applicationDeadline
                ? new Date(job.applicationDeadline).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )
                : "Not specified"
            }</p>
            <p><strong>Total Candidates Submitted:</strong> ${processedCandidates.length}</p>
            <p><strong>AI Ranking:</strong> ${aiAllowed ? "Enabled" : "Disabled"}</p>
          </div>

          ${
            job.skills?.length
              ? `
              <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px;">
                <h3 style="color:#667eea; margin-top:0;">Required Skills</h3>
                <p style="color:#555;">${job.skills.join(", ")}</p>
              </div>
              `
              : ""
          }

          ${
            job.clouds?.length
              ? `
              <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px;">
                <h3 style="color:#667eea; margin-top:0;">Required Clouds</h3>
                <p style="color:#555;">${job.clouds.join(", ")}</p>
              </div>
              `
              : ""
          }

          <!-- CANDIDATE LIST -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Submitted Candidates</h3>

            ${processedCandidates
              .map(
                (c) => `
                <div style="margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
                  
                  <div style="font-size: 16px; margin-bottom: 6px;">
                    <strong>${c.candidateName}</strong>
                  </div>

                    <a

href="${process.env.FRONTEND_URL}/company/candidate/${c.profile.id}"
                     style="display:inline-block;
                            padding:8px 14px;
                            background:#667eea;
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:6px;
                            font-size:14px;">
                    View Full Candidate Details
                  </a>

                </div>
              `,
              )
              .join("")}
          </div>

          <p style="color:#666; font-size:14px; margin-top:25px;">
            Click on any candidate to view complete profile details including experience,
            certifications, work history and skills.
          </p>

          <p style="color:#999; font-size:13px; margin-top:25px;">
            <em>This is an automated notification from the Job Portal.</em>
          </p>

        </div>
      </div>
      `,
      });
    } catch (emailError) {
      handleError(emailError);
      logger.error("[Background] Recruiter email failed:", emailError.message);
    }
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch saved candidates" + error.message,
    });
  }
};

// const markCandidateBookmark = async (req, res) => {
//   try {
//     const userAuth = req.user;
//     const { jobApplicationId } = req.body;

//     if (userAuth.role !== "company") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     if (!jobApplicationId) {
//       return res.status(400).json({ message: "jobApplicationId is required" });
//     }

//     const application = await prisma.jobApplication.findUnique({
//       where: { id: jobApplicationId },
//       include: {
//         job: { select: { postedById: true } },
//       },
//     });

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     if (application.job.postedById !== userAuth.id) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     await prisma.jobApplication.update({
//       where: { id: jobApplicationId },
//       data: { status: "BookMark" },
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Candidate marked as Bookmark",
//     });
//   } catch (error) {
//     console.error("markCandidateBookmark error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

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
        job: { select: { postedById: true, organizationId: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // if (application.job.postedById !== userAuth.id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }
    if (
      application.job.postedById !== userAuth.id &&
      application.job.organizationId !== userAuth.organizationId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 1️⃣ Update application status
    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status: "BookMark" },
    });

    // 2️⃣ ALSO SAVE INTO savedCandidate TABLE

    const existingSave = await prisma.savedCandidate.findFirst({
      where: {
        recruiterId: userAuth.id,
        organizationId: userAuth.organizationId,
        candidateProfileId: application.candidateProfileId,
      },
    });

    // Prevent duplicate insert
    if (!existingSave) {
      await prisma.savedCandidate.create({
        data: {
          recruiterId: userAuth.id,
          organizationId: userAuth.organizationId,
          candidateProfileId: application.candidateProfileId,
        },
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Candidate bookmarked and saved successfully",
    });
  } catch (error) {
    console.error("markCandidateBookmark error:", error);
    handleError(error, req, res);
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
