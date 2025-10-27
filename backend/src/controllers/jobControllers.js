import prisma from "../config/prisma.js"

// User applies for a job
const userApplyJob = async (req, res) => {
  try {
    // TODO: Implement user job application logic
    // - Extract userId and jobId from req
    // - Check if user already applied
    // - Create application record
    // - Return success response
    return res.status(501).json({
      status: "not_implemented",
      message: "User apply job functionality pending"
    })
  } catch (error) {
    console.error("userApplyJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// User withdraws job application
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
    console.error("userWithdrawJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// User saves a job
const userSavedJobs = async (req, res) => {
  try {
    // TODO: Implement save job logic
    // - Extract userId and jobId from req
    // - Check if job already saved
    // - Create saved job record
    // - Return success response
    return res.status(501).json({
      status: "not_implemented",
      message: "User save job functionality pending"
    })
  } catch (error) {
    console.error("userSavedJobs Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// User removes saved job
const userRemovedSavedJob = async (req, res) => {
  try {
    // TODO: Implement remove saved job logic
    // - Extract userId and jobId from req
    // - Check if saved job exists
    // - Delete saved job record
    // - Return success response
    return res.status(501).json({
      status: "not_implemented",
      message: "User remove saved job functionality pending"
    })
  } catch (error) {
    console.error("userRemovedSavedJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// Get all jobs user has applied to
const userAllApplyedJobs = async (req, res) => {
  try {
    // TODO: Implement get all applied jobs logic
    // - Extract userId from req
    // - Query all applications with job details
    // - Return list of applied jobs
    return res.status(501).json({
      status: "not_implemented",
      message: "Get all applied jobs functionality pending"
    })
  } catch (error) {
    console.error("userAllApplyedJobs Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// Get all jobs user has saved
const userAllSavedJobs = async (req, res) => {
  try {
    // TODO: Implement get all saved jobs logic
    // - Extract userId from req
    // - Query all saved jobs with job details
    // - Return list of saved jobs
    return res.status(501).json({
      status: "not_implemented",
      message: "Get all saved jobs functionality pending"
    })
  } catch (error) {
    console.error("userAllSavedJobs Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// hari
// Get list of jobs that are recently posted
 const getJobList = async (req, res) => {
  try{
    const jobs= await prisma.job.findMany()
    if(!jobs){
      return res.status(200).json({message:"Something went wrong"})
    }
    return res.status(200).json({
      status: "Success",
      jobs
    })
  }catch(error){
    console.error("userAllSavedJobs Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
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
      location,
      skills,
      salary,
      companyName,
      responsibilities,
      qualifications,
      jobType,
      applicationDeadline,
    } = req.body;
    console.log('body ##########',req.body)
    const userFromAuth = req.user

    const job = await prisma.job.create({
      data: {
        role,
        description,
        employmentType,
        experience,
        experienceLevel,
        location,
        skills,
        salary,
        companyName,
        responsibilities,
        qualifications,
        jobType,
        applicationDeadline,
        postedById: userFromAuth.id, // optional
      },
    });
    return res.status(201).json({
      status: "success",
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("postJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
}

// hari
// Get list of all jobs posted by company
const postedJobs = async (req, res) => {
  try {
    // ✅ Get userid from POST body
    const { userid } = req.body;

    // ✅ Fetch all jobs posted by this user
    const jobs = await prisma.job.findMany({
      where: { postedById: userid },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: "success",
      message: "Posted jobs fetched successfully",
      count: jobs.length,
      data: jobs
    });

  } catch (error) {
    console.error("postedJobs POST Error:", error);
    return res.status(500).json({
      status: "failed",
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
      location,
      skills,
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
      return res.status(404).json({
        status: "failed",
        message: "Job not found",
      });
    }

    // Optional: check if user is authorized to edit
    if (existingJob.postedById && existingJob.postedById !== userFromAuth.id) {
      return res.status(403).json({
        status: "failed",
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
        location,
        skills,
        salary,
        companyName,
        responsibilities,
        qualifications,
        jobType,
        status,
        applicationDeadline,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("editJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error",
    });
  }
};


// shruthi
// Delete job posted by company or vendor
const deleteJob = async (req, res) => {
  console.log("Delete Job API hit");
  try {
    const { jobIds,deletedReason } = req.body;  // For multiple delete
 
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
    console.error("deleteJob Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error",
    });
  }
};
 
const getJobDetails = async (req, res) => {
  try{
    const {jobid} = req.body
    const job= await prisma.job.findUnique({
      where:{id: jobid}
    })
    if(!job){
      return res.status(200).json({message:"Something went wrong"})
    }
    return res.status(200).json({
      status: "Success",
      job
    })
  }catch(error){
    console.error("userAllSavedJobs Error:", error);
    return res.status(500).json({
      status: "failed",
      error: error.message || "Internal server error"
    })
  }
};

export {
  userApplyJob,
  userWithdrawJob,
  userSavedJobs,
  userRemovedSavedJob,
  userAllApplyedJobs,
  userAllSavedJobs,
  getJobList,
  postJob,
  postedJobs,
  editJob,
  deleteJob,
  getJobDetails
}