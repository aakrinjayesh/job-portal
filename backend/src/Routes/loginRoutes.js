import express from 'express'
import { validateInput } from '../Middleware/inputValidator.js'
import { googleAuthValidator,OtpGenerateValidator,OtpValidator } from '../validators/userValidators.js';
import { googleAuth } from '../controllers/authControllers.js';
import {  userOtpGenerate, userOtpValidator, login, setPassword } from '../controllers/loginControllers.js';


const LoginRouters = express.Router()



// user login and auth routes
LoginRouters.post('/auth/google', validateInput(googleAuthValidator),googleAuth)
LoginRouters.post('/otp', validateInput(OtpGenerateValidator), userOtpGenerate)
LoginRouters.post('/otp/validate', validateInput(OtpValidator),userOtpValidator)
LoginRouters.post("/setpassword", setPassword)
LoginRouters.post("/login",login)



export default LoginRouters
