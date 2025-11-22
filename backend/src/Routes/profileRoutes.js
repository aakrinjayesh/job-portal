import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { 
UploadResumeValidator,
} from '../validators/userValidators.js'

import { 
  UploadResume, updateProfiledetails,  getUserProfileDetails,getCountriesWithStates,saveOrUpdateAddress, getUserAddress
} from '../controllers/profileControllers.js'



import multer from 'multer';
import { authenticateToken } from '../Middleware/authMiddleware.js';


const userRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() });




// user profile routes
userRouter.post('/upload', upload.single('file'), authenticateToken,UploadResume)


userRouter.put('/profile',
  // validateInput(userProfileValidator), 
  authenticateToken,updateProfiledetails);


// for the below just pass {} as payload
userRouter.post('/profile/details', authenticateToken, getUserProfileDetails);

// Countries & States endpoint
// (GET /api/countries)
// --------------------------------------
userRouter.get("/countries", authenticateToken, getCountriesWithStates);

// --------------------------------------
// Address Save / Update
// (POST /api/address)
// --------------------------------------
userRouter.put("/profile/update/address", authenticateToken, saveOrUpdateAddress);

userRouter.get("/profile/address", authenticateToken, getUserAddress);

export default userRouter