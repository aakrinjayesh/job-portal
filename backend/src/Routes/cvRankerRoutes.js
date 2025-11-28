import express from 'express'
import { cvEligibilityCheck } from '../controllers/cvRankerControllers.js'
import { authenticateToken } from '../Middleware/authMiddleware.js'
import { cvRankerValidator } from '../validators/userValidators.js'
import { validateInput } from '../Middleware/inputValidator.js'

const CVRouters = express.Router()


CVRouters.post('/check-eligibility', validateInput(cvRankerValidator), authenticateToken, cvEligibilityCheck)


export default CVRouters;