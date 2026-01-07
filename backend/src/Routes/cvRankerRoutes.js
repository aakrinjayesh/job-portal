import express from 'express'
import { AICandidateSearch, AIJobSearch, cvEligibilityCheck, generateJobDescription } from '../controllers/cvRankerControllers.js'
import { cvRankerValidator } from '../validators/userValidators.js'
import { validateInput } from '../Middleware/inputValidator.js'

const CVRouters = express.Router()


CVRouters.post('/check-eligibility', validateInput(cvRankerValidator), cvEligibilityCheck)

// ai job Descrition 
CVRouters.post('/generate-jd', generateJobDescription)

CVRouters.post('/ai-candidate-filter', AICandidateSearch)

CVRouters.post('/ai-job-filter', AIJobSearch)


export default CVRouters;