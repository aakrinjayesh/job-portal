import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';
import path from "path";


import userRouter from "./Routes/profileRoutes.js";
import JobRouters from "./Routes/jobRoutes.js";
import CommonRouters from "./Routes/commonRoutes.js";
import LoginRouters from "./Routes/loginRoutes.js";
import VendorRoutes from "./Routes/vendorRoutes.js";
import VerificationRoutes from "./Routes/verificationRoutes.js";
import CVRouters from "./Routes/cvRankerRoutes.js";


dotenv.config();


const app = express();

app.use(cors())
app.use(express.json())


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// app.use('/api/v1', userRouter)
app.use(LoginRouters)
app.use(userRouter)
app.use(JobRouters)
app.use(CommonRouters)
app.use('/vendor',VendorRoutes)
app.use("/verification", VerificationRoutes);
app.use(CVRouters);





const PORT = process.env.PORT

app.listen(PORT || '3001', () => console.log(`server Started at http://localhost:${PORT}`))
