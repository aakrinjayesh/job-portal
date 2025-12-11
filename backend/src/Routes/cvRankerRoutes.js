import express from 'express'
import { AICandidateSearch, AIJobSearch, cvEligibilityCheck, generateJobDescription } from '../controllers/cvRankerControllers.js'
import { authenticateToken } from '../Middleware/authMiddleware.js'
import { cvRankerValidator } from '../validators/userValidators.js'
import { validateInput } from '../Middleware/inputValidator.js'

const CVRouters = express.Router()


CVRouters.post('/check-eligibility', validateInput(cvRankerValidator), authenticateToken, cvEligibilityCheck)

// ai job Descrition 
CVRouters.post('/generate-jd', generateJobDescription)

CVRouters.post('/ai-candidate-filter',authenticateToken, AICandidateSearch)

CVRouters.post('/ai-job-filter',authenticateToken, AIJobSearch)


export default CVRouters;