import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { googleAuthValidator,OtpGenerateValidator,OtpValidator } from '../validators/userValidators.js';
import { googleAuth } from '../controllers/authControllers.js';
import {  userOtpGenerate, userOtpValidator, login, setPassword,resetPassword,forgotPassword,checkUserExists, refreshAccessToken, logout, getActiveDevices,
  logoutSingleDevice,
  logoutAll } from '../controllers/loginControllers.js';
import { authenticateToken } from '../Middleware/authMiddleware.js';


const LoginRouters = express.Router()



// user login and auth routes
LoginRouters.post('/auth/google', validateInput(googleAuthValidator),googleAuth)
LoginRouters.post('/otp', validateInput(OtpGenerateValidator), userOtpGenerate)
LoginRouters.post("/checkuser",checkUserExists)
LoginRouters.post('/otp/validate', validateInput(OtpValidator),userOtpValidator)
LoginRouters.post("/setpassword", setPassword)
LoginRouters.post("/login",login)
LoginRouters.post("/forgotpassword", forgotPassword);
LoginRouters.post("/resetpassword", resetPassword);
LoginRouters.get("/auth/refresh-token", refreshAccessToken);
LoginRouters.post("/auth/logout", logout)
LoginRouters.post("/auth/logout-all",logoutAll)
LoginRouters.get("/auth/devices",authenticateToken,getActiveDevices)
LoginRouters.delete("/auth/devices/:sessionId",logoutSingleDevice)



export default LoginRouters
