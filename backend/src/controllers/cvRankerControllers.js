import prisma from "../config/prisma.js";
// import { extractResumeSections } from "../utils/llmTextExtractor.js";
import { extractAIText } from "../utils/ai/extractAI.js";
import { incrementAIUsage } from "../utils/incrementAIUsage.js";
import { logger } from "../utils/logger.js";

// const cvEligibilityCheck = async (req, res) => {
//   const { jobId } = req.body;
//   const userId = req.user.id;
//   console.log("userId",userId)
//   if (!userId) {
//   return res.status(401).json({
//     status: "error",
//     message: "Unauthorized",
//   });
// }

//   logger.info("CV Eligibility Check Started", { jobId, userId });

//   try {
//     if (!jobId) {
//       logger.warn("Job ID missing in request", { userId });
//       return res.status(400).json({
//         status: "error",
//         message: "Job ID is required",
//       });
//     }

//     // 1️⃣ Fetch Job
//     const job = await prisma.job.findUnique({
//       where: { id: jobId, isDeleted: false },
//     });

//     if (!job) {
//       logger.warn("Job not found", { jobId });
//       return res.status(404).json({
//         status: "error",
//         message: "Job not found",
//       });
//     }

//     if (job.status !== "Open") {
//       logger.warn("Job is closed", { jobId, status: job.status });
//       return res.status(400).json({
//         status: "error",
//         message: "Job is closed",
//       });
//     }

//     // 2️⃣ Fetch User + Profile
//     const user = await prisma.users.findUnique({
//       where: { id: userId },
//       include: { CandidateProfile: true },
//     });

//     if (!user || !user.CandidateProfile) {
//       logger.warn("Candidate profile incomplete", { userId });
//       return res.status(400).json({
//         status: "error",
//         message: "Candidate profile incomplete",
//       });
//     }

//     logger.info("Job & Candidate profile fetched", { jobId, userId });

//     // Build Job Description Object
//     const jobDescription = {
//       job_id: job.id,
//       role: job.role,
//       description: job.description || "",
//       employmentType: job.employmentType || "FullTime",
//       skills: job.skills || [],
//       clouds: job.clouds || [],
//       salary: job.salary,
//       companyName: job.companyName,
//       responsibilities: job.responsibilities || [],
//       qualifications: job.qualifications || [],
//       experience: job.experience || "",
//       experienceLevel: job.experienceLevel || "",
//       location: job.location || "",
//     };

//     // Build Candidate Object
//     const profile = user.CandidateProfile;

//     const candidateDetails = {
//       userId: profile.userId,
//       title: profile.title || "",
//       name: profile.name || "",
//       phoneNumber: profile.phoneNumber || "",
//       email: profile.email || "",
//       currentLocation: profile.currentLocation || "",
//       preferredLocation: profile.preferredLocation || [],
//       preferredJobType: profile.preferredJobType || [],
//       currentCTC: profile.currentCTC || "",
//       expectedCTC: profile.expectedCTC || "",
//       joiningPeriod: profile.joiningPeriod || "",
//       totalExperience: profile.totalExperience || "",
//       relevantSalesforceExperience: profile.relevantSalesforceExperience || "",
//       skills: profile.skillsJson || [],
//       primaryClouds: profile.primaryClouds || [],
//       secondaryClouds: profile.secondaryClouds || [],
//       certifications: profile.certifications || [],
//       workExperience: profile.workExperience || [],
//       education: profile.education || [],
//       linkedInUrl: profile.linkedInUrl,
//       trailheadUrl: profile.trailheadUrl,
//     };
//     logger.info("Sending data to AI Ranker");

//     // 3️⃣ Run AI Analyzer (CV Ranker)
//     const aiAnalysisResult = await extractAIText(
//       "CV_RANKING",
//       "cvranker",
//       { jobDescription, candidateDetails }
//     );
//     logger.info("AI Analysis Completed", { userId, jobId });

//     return res.status(200).json({
//       status: "success",
//       message: "Eligibility checked successfully",
//       data: {
//         fitPercentage: aiAnalysisResult?.fit_percentage || 0,
//         analysis: aiAnalysisResult,
//       },
//       metadata:{
//         jobDescription,
//         candidateDetails,
//       },
//     });

//   } catch (error) {
//     logger.error("cvEligibilityCheck Error", JSON.stringify({
//       error: error.message,
//       userId,
//       jobId,
//     },null,2));

//     return res.status(500).json({
//       status: "error",
//       message: "Could not analyze eligibility",
//       error: error.message,
//     });
//   }
// };

const cvEligibilityCheck = async (req, res) => {
  const { jobId, jobApplicationId, candidateProfileId } = req.body;
  console.log("CV RANKER body", req.body);
  try {
    if (!jobId || !jobApplicationId || !candidateProfileId) {
      return res.status(400).json({
        status: "error",
        message: "jobId, jobApplicationId and candidateProfileId are required",
      });
    }

    // ✅ 1️⃣ Check if analysis already exists
    const existingAnalysis = await prisma.applicationAnalysis.findUnique({
      where: { jobApplicationId },
    });

    if (existingAnalysis) {
      return res.status(200).json({
        status: "success",
        message: "Existing analysis returned",
        data: {
          fitPercentage: existingAnalysis.fitPercentage,
          analysis: existingAnalysis.details,
        },
      });
    }

    // ✅ 2️⃣ Fetch Job
    const job = await prisma.job.findFirst({
      where: { id: jobId, isDeleted: false },
    });

    // ✅ 3️⃣ Fetch Candidate Profile
    const profile = await prisma.userProfile.findUnique({
      where: { id: candidateProfileId },
    });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Candidate profile not found",
      });
    }

    // ✅ 4️⃣ Build Job Description
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
      title: profile.title || "",
      name: profile.name || "",
      // phoneNumber: profile.phoneNumber || "",
      // email: profile.email || "",
      summary: profile.summary || "",
      currentLocation: profile.currentLocation || "",
      preferredLocation: profile.preferredLocation || [],
      preferredJobType: profile.preferredJobType || [],
      currentCTC: profile.currentCTC || "",
      expectedCTC: profile.expectedCTC || "",
      joiningPeriod: profile.joiningPeriod || "",
      totalExperience: profile.totalExperience || "",
      relevantSalesforceExperience: profile.relevantSalesforceExperience || "",
      skills: profile.skillsJson || [],
      primaryClouds: profile.primaryClouds || [],
      secondaryClouds: profile.secondaryClouds || [],
      certifications: profile.certifications || [],
      workExperience: profile.workExperience || [],
      education: profile.education || [],
      linkedInUrl: profile.linkedInUrl,
      trailheadUrl: profile.trailheadUrl,
    };

    // ✅ 6️⃣ Run AI Analysis
    const aiAnalysisResult = await extractAIText("CV_RANKING", "cvranker", {
      jobDescription,
      candidateDetails,
    });

    const fitPercentage = aiAnalysisResult?.data?.fit_percentage || 0;

    // ✅ 7️⃣ Upsert into ApplicationAnalysis
    await prisma.applicationAnalysis.upsert({
      where: { jobApplicationId },
      update: {
        fitPercentage,
        details: aiAnalysisResult.data,
        status: "COMPLETED",
      },
      create: {
        jobApplicationId,
        fitPercentage,
        details: aiAnalysisResult.data,
        status: "COMPLETED",
      },
    });

    await incrementAIUsage(req, aiAnalysisResult);

    return res.status(200).json({
      status: "success",
      message: "New AI analysis generated",
      data: {
        fitPercentage,
        analysis: aiAnalysisResult.data,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Could not analyze eligibility",
      error: error.message,
    });
  }
};

const generateJobDescription = async (req, res) => {
  logger.info("Generate JD Called");
  try {
    const jobdetails = req.body.jobdetails;

    if (!jobdetails) {
      logger.warn("jobdetails missing in request");
      return res.status(400).json({
        success: "error",
        message: "jobdetails field is required",
      });
    }

    logger.info("Sending jobdetails to JD Generator");
    const jd = await extractAIText("JD", "generatejd", { jobdetails });

    if (!jd) {
      logger.error("JD generation failed");
      return res.status(500).json({
        success: "error",
        message: "Failed to generate job description",
      });
    }
    await incrementAIUsage(req, jd);

    return res.status(200).json({
      status: "success",
      jobDescription: jd.data,
    });
  } catch (error) {
    logger.error(
      "Error generating JD",
      JSON.stringify({ error: error.message }, null, 2),
    );

    return res.status(500).json({
      success: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const AICandidateSearch = async (req, res) => {
  const { JD } = req.body;

  logger.info("AI Candidate Search Request Received");

  try {
    if (!JD || typeof JD !== "string") {
      logger.warn("Search text (JD) missing in request");
      return res.status(400).json({
        success: "error",
        message: "Search text is required",
      });
    }

    logger.info("Sending search text to AI Filter Extractor");

    // 🔥 Call your AI model with system prompt inside extractResumeSections
    const aiResult = await extractAIText("SEARCH", "aicandidatefilter", { JD });

    if (!aiResult) {
      logger.error("AI Search returned empty result");
      return res.status(500).json({
        success: "error",
        message: "AI could not process the filter",
      });
    }

    await incrementAIUsage(req, aiResult);

    return res.status(200).json({
      success: "success",
      message: "AI Search filter extracted successfully",
      filter: aiResult.data,
      tokenUsage: aiResult.tokenUsage,
    });
  } catch (error) {
    logger.error("AISearch Error", JSON.stringify(error.message, null, 2));

    return res.status(500).json({
      success: "error",
      message: "Failed to process AI search",
      error: error.message,
    });
  }
};

const AIJobSearch = async (req, res) => {
  const { JD } = req.body;

  logger.info("AI Job Search Request Received");

  try {
    if (!JD || typeof JD !== "string") {
      logger.warn("Search text  missing in request");
      return res.status(400).json({
        success: "error",
        message: "Search text is required",
      });
    }

    const aiResult = await extractAIText("SEARCH", "aijobfilter", { JD });

    if (!aiResult) {
      logger.error("AI Search returned empty result");
      return res.status(500).json({
        success: "error",
        message: "AI could not process the filter",
      });
    }

    await incrementAIUsage(req, aiResult);

    return res.status(200).json({
      success: "success",
      message: "AI Search filter extracted successfully",
      filter: aiResult.data,
    });
  } catch (error) {
    logger.error("AISearch Error", JSON.stringify(error.message, null, 2));

    return res.status(500).json({
      success: "error",
      message: "Failed to process AI search",
      error: error.message,
    });
  }
};

export {
  cvEligibilityCheck,
  generateJobDescription,
  AICandidateSearch,
  AIJobSearch,
};
