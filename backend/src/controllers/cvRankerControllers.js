import prisma  from "../config/prisma.js";
import { extractResumeSections } from "../utils/llmTextExtractor.js";

const cvEligibilityCheck = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id; 

    if (!jobId) {
      return res.status(400).json({
        status: "failed",
        message: "Job ID is required",
      });
    }

    // 1️⃣ Fetch Job
    const job = await prisma.job.findUnique({
      where: { id: jobId, isDeleted: false },
    });

    if (!job) {
      return res.status(404).json({
        status: "failed",
        message: "Job not found",
      });
    }

    if (job.status !== "Open") {
      return res.status(400).json({
        status: "failed",
        message: "Job is closed",
      });
    }

    // 2️⃣ Fetch User + Profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { CandidateProfile: true },
    });

    if (!user || !user.CandidateProfile) {
      return res.status(400).json({
        status: "failed",
        message: "Candidate profile incomplete",
      });
    }

    // Build Job Description Object
    const jobDescription = {
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
      experienceLevel: job.experienceLevel || "",
      location: job.location || "",
    };

    // Build Candidate Object
    const profile = user.CandidateProfile;

    const candidateDetails = {
      userId: profile.userId,
      title: profile.title || "",
      name: profile.name || "",
      phoneNumber: profile.phoneNumber || "",
      email: profile.email || "",
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

    // 3️⃣ Run AI Analyzer (CV Ranker)
    const aiAnalysisResult = await extractResumeSections(
      "CV_RANKING",
      "cvranker",
      { jobDescription, candidateDetails }
    );

    return res.status(200).json({
      status: "success",
      message: "Eligibility checked successfully",
      data: {
        fitPercentage: aiAnalysisResult?.fit_percentage || 0,
        analysis: aiAnalysisResult,
      },
      metadata:{
        jobDescription,
        candidateDetails
      }
    });

  } catch (error) {
    console.error("cvEligibilityCheck Error:", error);

    return res.status(500).json({
      status: "failed",
      message: "Could not analyze eligibility",
      error: error.message,
    });
  }
};

export {
  cvEligibilityCheck
}