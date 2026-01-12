import express from 'express'
import { 
  getJobList, 
  postJob, 
  userApplyJob, 
  // userWithdrawJob, 
  userSaveJob, 
  userAllApplyedJobs, 
  userAllSavedJobs, 
  postedJobs, 
  editJob, 
  deleteJob,
  getJobDetails,
  getApplicantsByJobId,
  getUserAppliedJobsId, 
  userUnsaveJob,
   saveCandidateRating  
} from '../controllers/jobControllers.js'
import { validateInput } from '../Middleware/inputValidator.js'
import { authenticateToken } from '../Middleware/authMiddleware.js'

import { 
  getJobListValidator, 
  postJobValidator,
  applyJobValidator,
  withdrawJobValidator,
  saveJobValidator,
  removeSavedJobValidator,
  editJobValidator,
  deleteJobValidator,
  postedJobValidator,
  getJobDeatilsValidator,
   
} from '../validators/userValidators.js'



const JobRouters = express.Router()

// Public job routes
JobRouters.post('/jobs/list', 
  // validateInput(getJobListValidator), 
  // authenticateToken,
   getJobList)
JobRouters.post('/job/details',
  validateInput(getJobDeatilsValidator), 
  // authenticateToken, 
  getJobDetails)


// User job application routes
JobRouters.post('/jobs/apply', validateInput(applyJobValidator), authenticateToken, userApplyJob)
// JobRouters.delete('/jobs/:jobId/withdraw', validateInput(withdrawJobValidator), authenticateToken, userWithdrawJob)
JobRouters.get('/jobs/applied/all', authenticateToken, userAllApplyedJobs)
JobRouters.get('/job/applied/ids', authenticateToken, getUserAppliedJobsId)



// User saved jobs routes
JobRouters.post('/jobs/save', 
  // validateInput(saveJobValidator), 
  authenticateToken, userSaveJob)

JobRouters.post('/jobs/unsave', 
  // validateInput(removeSavedJobValidator),
   authenticateToken, userUnsaveJob)
JobRouters.get('/jobs/saved', authenticateToken, userAllSavedJobs)




// Company/Vendor job management routes
JobRouters.post('/jobs/create', 
  validateInput(postJobValidator), 
  authenticateToken, postJob)
JobRouters.get('/jobs/posted',
  // validateInput(postedJobValidator),
  authenticateToken, postedJobs)
JobRouters.post('/jobs/update', 
  validateInput(editJobValidator), 
  authenticateToken, editJob)
JobRouters.delete('/jobs/delete', validateInput(deleteJobValidator), authenticateToken, deleteJob)



JobRouters.post("/job/applicants", authenticateToken, getApplicantsByJobId)

JobRouters.post(
  "/candidate/rating",
  authenticateToken,
  saveCandidateRating
);




export default JobRouters