import prisma from "../config/prisma.js"
import sendEmail from "../utils/sendEmail.js";
import puppeteer from 'puppeteer';
import { generateResumeHTML } from "../utils/resumeTemplate.js";
import fs from 'fs'
import path from 'path'
import { extractResumeSections } from "../utils/llmTextExtractor.js";
import { logger } from "../utils/logger.js";


// User applies for a job


const userApplyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id; 

    if (!jobId) {
      logger.warn("Job ID missing in userApplyJob");
      return res.status(400).json({ status: "error", message: "Job ID is required" });
    }

    // 1. Fetch Job
    const job = await prisma.job.findFirst({
      where: { id: jobId, isDeleted: false },
      include: {
        postedBy: { select: { id: true, name: true, email: true } }
      }
    });

    if (!job) {
      logger.warn(`Job not found - ID: ${jobId}`);
      return res.status(404).json({ status: "error", message: "Job not found" });
    }
    if (job.status !== 'Open') {
      logger.warn(`Job closed - ID: ${jobId}`);
      return res.status(400).json({ status: "error", message: "Job closed" });
    }

    // 2. Check Existing Application
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId, userId } }
    });
    if (existingApplication) {
      logger.warn(`User already applied - jobId: ${jobId}, userId: ${userId}`);
      return res.status(409).json({ status: "error", message: "Already applied" });
    }

    // 3. Fetch User Profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { CandidateProfile: true }
    });

    if (!user) {
      logger.warn(`User not found - ID: ${userId}`);
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if(!user.CandidateProfile){
      return res.status(404).json({
        status:"error",
        message: "Fill The Candidate Details First!"
      })
    }

    // ============================================================
    // STEP 4: AI ANALYSIS (Real-time)
    // ============================================================
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
      companyName: job?.companyName || ""
    };

    const profile = user.CandidateProfile;


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
      trailheadUrl: profile?.trailheadUrl || null
    };

    // Only run AI if candidate has a profile
    if (user.CandidateProfile) {
        aiAnalysisResult = await extractResumeSections("CV_RANKING","cvranker",{jobDescription, candidateDetails});
        logger.info('aicvranker', JSON.stringify(aiAnalysisResult,null,2))
    }

    // ============================================================
    // STEP 5: SAVE TO DB (Transaction)
    // ============================================================
    const application = await prisma.$transaction(async (tx) => {
      // A. Create the base Application
      const newApp = await tx.jobApplication.create({
        data: {
          jobId,
          userId,
          status: 'Pending'
        }
      });

      // B. Create the Analysis (if AI succeeded)
      if (aiAnalysisResult) {
        await tx.applicationAnalysis.create({
          data: {
            jobApplicationId: newApp.id,
            fitPercentage: aiAnalysisResult.fit_percentage || 0,
            details: aiAnalysisResult, // Stores the full JSON
            status: 'COMPLETED'
          }
        });
      }

      return newApp;
    });

    // ============================================================
    // STEP 6: POST-PROCESSING (PDF & Emails) - Kept original logic
    // ============================================================
    
    // Generate resume HTML
    const resumeHTML = generateResumeHTML(user, user.CandidateProfile, job);
    let pdfBuffer;
    
    try {
      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(resumeHTML, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
    } catch (pdfError) {
      logger.error('PDF Generation Error:', JSON.stringify(pdfError.message,null,2));
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
                  <p style="margin: 10px 0;"><strong>Job Position:</strong> ${job.role}</p>
                  <p style="margin: 10px 0;"><strong>Company:</strong> ${job.companyName}</p>
                  <p style="margin: 10px 0;"><strong>Candidate Name:</strong> ${user.name}</p>
                  <p style="margin: 10px 0;"><strong>Candidate Email:</strong> ${user.email}</p>
                  <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                ${user.CandidateProfile ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #667eea; margin-top: 0;">Quick Summary</h3>
                  ${user.CandidateProfile.title ? `<p><strong>Current Role:</strong> ${user.CandidateProfile.title}</p>` : ''}
                  ${user.CandidateProfile.totalExperience ? `<p><strong>Experience:</strong> ${user.CandidateProfile.totalExperience}</p>` : ''}
                  ${user.CandidateProfile.currentLocation ? `<p><strong>Location:</strong> ${user.CandidateProfile.currentLocation}</p>` : ''}
                  ${user.CandidateProfile.expectedCTC ? `<p><strong>Expected CTC:</strong> ₹${user.CandidateProfile.expectedCTC}</p>` : ''}
                  ${user.CandidateProfile.joiningPeriod ? `<p><strong>Notice Period:</strong> ${user.CandidateProfile.joiningPeriod}</p>` : ''}
                </div>
                ` : ''}

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  📎 Please find the detailed resume attached to this email.
                </p>
                
                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  <em>This is an automated notification from the Job Portal.</em>
                </p>
              </div>
            </div>
          `,
          attachments: pdfBuffer ? [{
            filename: `${user.name.replace(/\s+/g, '_')}_Resume.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }] : []
        });
      } catch (emailError) {
        logger.error('Error sending email to poster:', JSON.stringify(emailError.message,null,2));
      }
    }

    // Send Email to Candidate
    try {
      await sendEmail({
        to: user.email,
        subject: `Application Submitted - ${job.role} at ${job.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">Application Submitted Successfully! ✅</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px;">Hi ${user.name},</p>
              
              <p style="color: #666;">Your application has been successfully submitted for the following position:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Position:</strong> ${job.role}</p>
                <p style="margin: 10px 0;"><strong>Company:</strong> ${job.companyName}</p>
                <p style="margin: 10px 0;"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                <p style="margin: 10px 0;"><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <p style="color: #666;">The employer will review your application and get back to you if your profile matches their requirements.</p>
              
              <p style="color: #666; margin-top: 20px;">Good luck! 🍀</p>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                <em>This is an automated confirmation from the Job Portal.</em>
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      logger.error('Error sending confirmation email:', JSON.stringify(emailError.message,null,2));
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
          matchScore: aiAnalysisResult?.fit_percentage
        }
      }
    });

  } catch (error) {
    logger.error("userApplyJob Error:", JSON.stringify(error.message,null,2));
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
      userId
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
              createdAt: true
            }
          }
        },
        orderBy: {
          appliedAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        applications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error("userAllAppliedJobs Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch applied jobs"+ error.message,
    });
  }
};


const userSaveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(200).json({
        status: "failed",
        message: "Job ID is required"
      });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      logger.warn(`Job not found while saving - ID: ${jobId}`);
      return res.status(404).json({
        status: "error",
        message: "Job not found"
      });
    }

    if (job.isDeleted) {
      logger.warn(`Attempt to save deleted job - ID: ${jobId}`);
      return res.status(400).json({
        status: "error",
        message: "This job has been deleted"
      });
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId
        }
      }
    });

    if (existingSave) {
      logger.warn(`Job already saved - jobId: ${jobId}, userId: ${userId}`);
      return res.status(409).json({
        status: "error",
        message: "Job already saved"
      });
    }

    // Save the job
    const savedJob = await prisma.savedJob.create({
      data: {
        jobId,
        userId
      },
      include: {
        job: {
          select: {
            id: true,
            role: true,
            companyName: true,
            location: true,
            salary: true
          }
        }
      }
    });

    return res.status(201).json({
      status: "success",
      message: "Job saved successfully",
      data: savedJob
    });

  } catch (error) {
    logger.error("userSaveJob Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Failed to save job" +  error.message,
    });
  }
};


const userUnsaveJob = async (req, res) => {
  try {
    logger.info("unsave clicked")
    const { jobId } = req.body;
    const userId = req.user.id;

     if (!jobId) {
      logger.warn("Job ID missing in userUnsaveJob");
      return res.status(400).json({
        status: "error",
        message: "Job ID is required"
      });
    }

    // Delete saved job
    const deleted = await prisma.savedJob.deleteMany({
      where: {
        jobId,
        userId
      }
    });

    if (deleted.count === 0) {
      logger.warn(`Saved job not found - jobId: ${jobId}, userId: ${userId}`);
      return res.status(404).json({
        status: "error",
        message: "Saved job not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Job removed from saved list"
    });

  } catch (error) {
    logger.error("userUnsaveJob Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Failed to unsave job" + error.message,
    });
  }
};


const userAllSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get saved jobs with job details
    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId },
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
              applicationDeadline: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          savedAt: "desc"
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.savedJob.count({ where: { userId } })
    ]);

    // Format response + add deadline warning + add isSaved flag
    const formattedJobs = savedJobs.map(saved => {
      const deadlineDate = new Date(saved.job.applicationDeadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil(
        (deadlineDate - today) / (1000 * 60 * 60 * 24)
      );

      return {
        ...saved.job,            // flatten job details
        isSaved: true,           // ADD THIS → unify with getJobList
        savedAt: saved.savedAt,  // keep saved timestamp if needed
        deadlineWarning:
          daysUntilDeadline <= 7 && daysUntilDeadline > 0,
        daysUntilDeadline
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        savedJobs: formattedJobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error("userAllSavedJobs Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch saved jobs" + error.message,
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
      message: "User withdraw job functionality pending"
    })
  } catch (error) {
    logger.error("userWithdrawJob Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error"
    })
  }
}




const getJobList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
 
    const userId = req.user?.id; // user may be optional (if public list)
 
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: {
          isDeleted: false
        },
        include: userId
          ? {
              savedBy: {
                where: { userId },
                select: { id: true }
              }
            }
          : false
      }),
      prisma.job.count({
        where: { isDeleted: false }
      })
    ]);
 
    // Add isSaved flag
    const jobsWithSavedStatus = jobs.map(job => ({
      ...job,
      isSaved: job.savedBy && job.savedBy.length > 0
    }));
 
    return res.status(200).json({
      status: "success",
      jobs: jobsWithSavedStatus,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
 
  } catch (error) {
    logger.error("getJobList Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error",
    });
  }
};



// jayesh
// Post a job by company or vendor
const postJob = async (req, res) => {
  try {
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
    } = req.body;
    
    logger.log('body ##########',JSON.stringify(req.body,null,2));

    const userFromAuth = req.user

    const job = await prisma.job.create({
      data: {
        role,
        description,
        employmentType,
        experience,
        experienceLevel,
        location,
        tenure,
        skills,
        clouds,
        salary,
        companyName,
        responsibilities,
        certifications,
        jobType,
        applicationDeadline,
        postedById: userFromAuth.id, // optional
      },
    });

    logger.info(`Job posted successfully - jobId: ${job.id}`);

    return res.status(201).json({
      status: "success",
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    logger.error("postJob Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error"
    })
  }
}

// hari
// Get list of all jobs posted by company
const postedJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userFromAuth = req.user

    // ❗ Validate userId
   if (!userFromAuth.id) {
      logger.warn("User ID missing in postedJobs");
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }

    // 🟢 Fetch paginated jobs & count based on userId + isDeleted
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        where: { postedById: userFromAuth.id, isDeleted: false },
        orderBy: { createdAt: "desc" }
      }),

      prisma.job.count({
        where: { postedById: userFromAuth.id, isDeleted: false }
      })
    ]);

    return res.status(200).json({
      status: "success",
      message: "Posted jobs fetched successfully",
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      jobs
    });

  } catch (error) {
    logger.error("postedJobs POST Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      error: error.message || "Internal server error"
    });
  }
};



// Edit job posted by company or vendor
const editJob = async (req, res) => {
  try {
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
    } = req.body;

    const userFromAuth = req.user;

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
    if (existingJob.postedById && existingJob.postedById !== userFromAuth.id) {
      logger.warn(`Unauthorized job edit attempt - jobId: ${id}, userId: ${userFromAuth.id}`);
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to edit this job",
      });
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
        tenure,
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
      },
    });

    logger.info(`Job updated successfully - jobId: ${id}`);

    return res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    logger.error("editJob Error:", JSON.stringify(error.message,null,2));
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
    const { jobIds, deletedReason } = req.body;  // For multiple delete
 
    if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
      await prisma.job.updateMany({
        where: { id: { in: jobIds } },
        data: {
        isDeleted: true,
        deletedReason,
        deletedAt: new Date()
      },
      });
 
      return res.status(200).json({
        status: "success",
        message: "jobs deleted successfully"
      });
    }
  } catch (error) {
    logger.error("deleteJob Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};
 
const getJobDetails = async (req, res) => {
  try{
    const {jobid} = req.body
    
    const job= await prisma.job.findFirst({
      where:{id: jobid}
    })

    if(!job){
      logger.warn(`Job not found - ID: ${jobid}`);
      return res.status(404).json({ status:"error", message:"Job not found" })
    }

    return res.status(200).json({
      status: "Success",
      job
    })

  }catch(error){
    logger.error("getJobDetails Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error"
    })
  }
};




const getApplicantsByJobId = async (req, res) => {
  try {
    const { jobId } = req.body; 

    if (!jobId) {
      logger.warn("Missing jobId in getApplicantsByJobId body");
      return res.status(400).json({ message: "jobId is missing!" });
    }

    // Fetch applications with AI Analysis included
    const applicants = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        user: {
          include: {
            CandidateProfile: true,
          },
        },
        // Include the AI rank details
        analysis: {
          select: {
            fitPercentage: true,
            details: true,
            status: true
          }
        }
      },
      // SORTING LOGIC: Highest Match First
      orderBy: [
        {
          analysis: {
            fitPercentage: 'desc' 
          }
        },
        {
          appliedAt: 'desc' // Fallback for equal scores or missing analysis
        }
      ]
    });

    logger.info('applicants',applicants)

    if (applicants.length === 0) {
      logger.info(`No applicants found for jobId ${jobId}`);
      return res.status(200).json({ 
        status:"success", 
        message:"No applications found", 
        data: [] });
    }

    // Format response for Frontend
    const formattedApplicants = applicants.map((app) => ({
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      userId: app.user.id,
      name: app.user.name,
      email: app.user.email,
      profile: app.user.CandidateProfile,
      matchScore: app.analysis?.fitPercentage || 0,
      aiAnalysis: app.analysis?.details || null
    }));

    return res.status(200).json({
      status:"success",
      message: "Applicants fetched successfully",
      count: formattedApplicants.length,
      data: formattedApplicants,
    });

  } catch (error) {
    logger.error("Error fetching applicants:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status:"error",
      message: "Internal server error"+error.message,
    });
  }
};

const getUserAppliedJobsId = async (req,res) =>{
  try {
    const userAuth = req.user
    const userJobid = await prisma.jobApplication.findMany({
      where:{
        userId: userAuth.id
      },
      select:{
        jobId: true
      }
    })

    if(!userJobid){
      logger.warn("User applied jobs fetch failed")
      return res.status(500).json({
        status:"error",
        message: "Could not Fetch Job Details"
      })
    }

    const jobids = userJobid.map((item) => item.jobId);

    res.status(200).json({
      status:"success",
      message: "successfully fetched job details",
      jobids
    })
  } catch (error) {
    logger.error(`getUserAppliedJobsId Error: ${JSON.stringify(error.message,null,2)}`)
    return res.status(500).json({
        status:"error",
        message: `Something went wrong!${error.message}`
      })
  }
}

export {
  userApplyJob,
  userWithdrawJob,
  userSaveJob,
  userAllApplyedJobs,
  userAllSavedJobs,
  userUnsaveJob,
  getJobList,
  postJob,
  postedJobs,
  editJob,
  deleteJob,
  getJobDetails,
  getApplicantsByJobId,
  getUserAppliedJobsId
}