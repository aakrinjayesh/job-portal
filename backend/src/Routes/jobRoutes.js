// import express from 'express'
// import { getJobList,postJob } from '../controllers/jobControllers.js'
// import { validateInput } from '../Middleware/inputValidator.js'
// import { authenticateToken } from '../Middleware/authMiddleware.js';

// import { getJobListValidator, postJobValidator } from '../validators/userValidators.js';

// const JobRouters = express.Router()


// JobRouters.post('/jobs',validateInput(getJobListValidator), authenticateToken, getJobList)
// JobRouters.post('/jobs',validateInput(postJobValidator), authenticateToken, postJob)


// export default JobRouters





import express from 'express'
import { 
  getJobList, 
  postJob, 
  userApplyJob, 
  userWithdrawJob, 
  userSaveJob, 
  userRemovedSavedJob, 
  userAllApplyedJobs, 
  userAllSavedJobs, 
  postedJobs, 
  editJob, 
  deleteJob,
  getJobDetails,
  checkIfJobSaved,
  getApplicantsByJobId,
  getUserAppliedJobsId 
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
  getJobDeatilsValidator
} from '../validators/userValidators.js'

const JobRouters = express.Router()

// Public job routes
JobRouters.get('/jobs', 
  // validateInput(getJobListValidator), 
  authenticateToken,
   getJobList)
JobRouters.post('/job/details',validateInput(getJobDeatilsValidator), authenticateToken, getJobDetails)


// User job application routes
JobRouters.post('/jobs/apply', validateInput(applyJobValidator), authenticateToken, userApplyJob)
// JobRouters.delete('/jobs/:jobId/withdraw', validateInput(withdrawJobValidator), authenticateToken, userWithdrawJob)
JobRouters.get('/jobs/applications', authenticateToken, userAllApplyedJobs)
JobRouters.get('/job/applied/ids', authenticateToken, getUserAppliedJobsId)



// User saved jobs routes
JobRouters.post('/jobs/save', 
  // validateInput(saveJobValidator), 
  authenticateToken, userSaveJob)

JobRouters.delete('/jobs/unsave', 
  // validateInput(removeSavedJobValidator),
   authenticateToken, userRemovedSavedJob)
JobRouters.get('/jobs/saved', authenticateToken, userAllSavedJobs)
JobRouters.get('/saved/:jobId', authenticateToken, checkIfJobSaved);



// Company/Vendor job management routes
JobRouters.post('/jobs/create', 
  validateInput(postJobValidator), 
  authenticateToken, postJob)
JobRouters.post('/jobs/posted',validateInput(postedJobValidator),authenticateToken, postedJobs)
JobRouters.post('/jobs/update', 
  validateInput(editJobValidator), 
  authenticateToken, editJob)
JobRouters.delete('/jobs/delete', validateInput(deleteJobValidator), authenticateToken, deleteJob)



JobRouters.post("/job/applicants", authenticateToken, getApplicantsByJobId)


export default JobRouters