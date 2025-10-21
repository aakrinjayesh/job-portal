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
  userSavedJobs, 
  userRemovedSavedJob, 
  userAllApplyedJobs, 
  userAllSavedJobs, 
  postedJobs, 
  editJob, 
  deleteJob 
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
  deleteJobValidator
} from '../validators/userValidators.js'

const JobRouters = express.Router()

// Public job routes
JobRouters.get('/jobs', validateInput(getJobListValidator), getJobList) // Changed to GET
JobRouters.post('/jobs/filter', validateInput(getJobListValidator), authenticateToken, getJobList) // For filtered search



// User job application routes
JobRouters.post('/jobs/:jobId/apply', validateInput(applyJobValidator), authenticateToken, userApplyJob)
JobRouters.delete('/jobs/:jobId/withdraw', validateInput(withdrawJobValidator), authenticateToken, userWithdrawJob)
JobRouters.get('/jobs/applied', authenticateToken, userAllApplyedJobs)



// User saved jobs routes
JobRouters.post('/jobs/:jobId/save', validateInput(saveJobValidator), authenticateToken, userSavedJobs)
JobRouters.delete('/jobs/:jobId/unsave', validateInput(removeSavedJobValidator), authenticateToken, userRemovedSavedJob)
JobRouters.get('/jobs/saved', authenticateToken, userAllSavedJobs)



// Company/Vendor job management routes
JobRouters.post('/jobs/create', validateInput(postJobValidator), authenticateToken, postJob)
JobRouters.get('/jobs/posted', authenticateToken, postedJobs)
JobRouters.put('/jobs/:jobId', validateInput(editJobValidator), authenticateToken, editJob)
JobRouters.patch('/jobs/:jobId', validateInput(editJobValidator), authenticateToken, editJob) // Alternative for partial updates
JobRouters.delete('/jobs/:jobId', validateInput(deleteJobValidator), authenticateToken, deleteJob)




export default JobRouters