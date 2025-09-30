import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { 
  // registerInputValidator, loginInputValidator,
userProfileValidator, OtpValidator } from '../validators/userValidators.js'
import { 
  // userRegister, userLogin,
  userUploadTicket, userProfiledetails, userOtpGenerate,userOtpValidator} from '../controllers/userControllers.js'
import multer from 'multer';
import { authenticateToken } from '../Middleware/authMiddleware.js';
import { googleAuth } from '../controllers/authControllers.js';

const userRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });

// userRouter.post('/register', validateInput(registerInputValidator), userRegister)
// userRouter.post('/login', validateInput(loginInputValidator), userLogin)
userRouter.post('/upload', upload.single('file'), authenticateToken, userUploadTicket)
userRouter.post('/profile', authenticateToken, validateInput(userProfileValidator), userProfiledetails)
userRouter.post('/auth/google',googleAuth)
userRouter.post('/otp', validateInput(OtpValidator), userOtpGenerate)
userRouter.post('/otp/validate', userOtpValidator)

export default userRouter