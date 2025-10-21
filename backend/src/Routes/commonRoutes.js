import express from 'express'

import { validateInput } from '../Middleware/inputValidator.js'
import { authenticateToken } from '../Middleware/authMiddleware.js';
import { getAllSkills,updateSkills, getAllCertifications, updateCertifications, getAllLocations, updateLocation, getAllClouds, addCloud} from '../controllers/commonControllers.js';
import { updateSkillsValidator,updateCertificationsValidator,updateLocationValidator ,addCloudValidator } from '../validators/userValidators.js';



const CommonRouters = express.Router()

// skills routes
CommonRouters.get('/skills', getAllSkills);
CommonRouters.post('/skills', validateInput(updateSkillsValidator),authenticateToken, updateSkills);


// certifications routes
CommonRouters.get('/certifications', getAllCertifications);
CommonRouters.post('/certifications',validateInput(updateCertificationsValidator), authenticateToken, updateCertifications);


// location routes
CommonRouters.get('/locations', getAllLocations);
CommonRouters.post('/locations', validateInput(updateLocationValidator),authenticateToken, updateLocation);

// clouds routes(salesforce clouds)
CommonRouters.get('/clouds', getAllClouds);
CommonRouters.post('/clouds', validateInput(addCloudValidator),authenticateToken, addCloud);



export default CommonRouters
