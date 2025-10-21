import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';

import userRouter from "./Routes/profileRoutes.js";
import JobRouters from "./Routes/jobRoutes.js";
import CommonRouters from "./Routes/commonRoutes.js";
import LoginRouters from "./Routes/loginRoutes.js";



dotenv.config();


const app = express();

app.use(cors())
app.use(express.json())

// app.use('/api/v1', userRouter)
app.use(LoginRouters)
app.use(userRouter)
app.use(JobRouters)
app.use(CommonRouters)


const PORT = process.env.PORT

app.listen(PORT || '3001', () => console.log(`server Started at http://localhost:${PORT}`))
