import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { 
UploadResumeValidator,
} from '../validators/userValidators.js'

import { 
  UploadResume, updateProfiledetails,  getUserProfileDetails,uploadProfilePicture,getCountriesWithStates,updateUserProfileDetails,
  getCompanyProfileDetails,
} from '../controllers/profileControllers.js'



import multer from 'multer';
import { authenticateToken } from '../Middleware/authMiddleware.js';


const userRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });



//candidates routes

// user to upload pdf in profile page
userRouter.post('/upload', upload.single('file'), authenticateToken,UploadResume)


// user profile details 
userRouter.post('/profile',
  // validateInput(userProfileValidator), 
  authenticateToken,updateProfiledetails);

userRouter.post('/profile/details', 
  authenticateToken,getUserProfileDetails);


// Profile Picture  save Route
userRouter.post(
  "/profile/upload-picture",
  authenticateToken,
  upload.single("file"),
  uploadProfilePicture
);


// company routes purely 

userRouter.get('/profile/details', authenticateToken, getCompanyProfileDetails);

userRouter.post("/profile/update", authenticateToken, updateUserProfileDetails);

userRouter.get("/countries", authenticateToken, getCountriesWithStates);




export default userRouter