import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { 
  // registerInputValidator, loginInputValidator,
userProfileValidator, OtpValidator, 
googleAuthValidator,
UploadResumeValidator,
updateSkillsValidator,
updateCertificationsValidator,
updateLocationValidator,
addCloudValidator,
OtpGenerateValidator} from '../validators/userValidators.js'
import { 
  // userRegister, userLogin,
  userUploadTicket, userProfiledetails, userOtpGenerate,userOtpValidator, getAllSkills, getAllCertifications, getAllLocations, updateCertifications, updateLocation, updateSkills, getUserProfileDetails, getAllClouds, addCloud, getJobList
} from '../controllers/userControllers.js'
import multer from 'multer';
import { authenticateToken } from '../Middleware/authMiddleware.js';
import { googleAuth } from '../controllers/authControllers.js';

const userRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });




// user login and auth routes
userRouter.post('/auth/google', validateInput(googleAuthValidator),googleAuth)
userRouter.post('/otp', validateInput(OtpGenerateValidator), userOtpGenerate)
userRouter.post('/otp/validate', validateInput(OtpValidator),userOtpValidator)



// user profile routes
userRouter.post('/upload', upload.single('file'), validateInput(UploadResumeValidator),authenticateToken,userUploadTicket)
userRouter.post('/profile',
  // validateInput(userProfileValidator), 
  authenticateToken,userProfiledetails);
// for the below just pass {} as payload
userRouter.post('/profile/details', authenticateToken, getUserProfileDetails);



// skills routes
userRouter.get('/skills', getAllSkills);
userRouter.post('/skills', validateInput(updateSkillsValidator),authenticateToken, updateSkills);


// certifications routes
userRouter.get('/certifications', getAllCertifications);
userRouter.post('/certifications',validateInput(updateCertificationsValidator), authenticateToken, updateCertifications);


// location routes
userRouter.get('/locations', getAllLocations);
userRouter.post('/locations', validateInput(updateLocationValidator),authenticateToken, updateLocation);

// clouds routes(salesforce clouds)
userRouter.get('/clouds', getAllClouds);
userRouter.post('/clouds', validateInput(addCloudValidator),authenticateToken, addCloud);


// job routes
userRouter.get('/jobs', getJobList)

export default userRouter