import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { 
UploadResumeValidator,
} from '../validators/userValidators.js'

import { 
  UploadResume, updateProfiledetails,  getUserProfileDetails,uploadProfilePicture
} from '../controllers/profileControllers.js'



import multer from 'multer';
import { authenticateToken } from '../Middleware/authMiddleware.js';


const userRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });




// user profile routes
userRouter.post('/upload', upload.single('file'), authenticateToken,UploadResume)


userRouter.post('/profile',
  // validateInput(userProfileValidator), 
  authenticateToken,updateProfiledetails);


// for the below just pass {} as payload
userRouter.post('/profile/details', authenticateToken, getUserProfileDetails);

// NEW: Profile Picture Route
// --------------------------
userRouter.post(
  "/profile/upload-picture",
  authenticateToken,
  upload.single("file"),
  uploadProfilePicture
);





export default userRouter