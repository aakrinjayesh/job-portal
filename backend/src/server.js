import express from "express";
import userRouter from "./Routes/userRoutes.js";
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config();


const app = express();

app.use(cors())
app.use(express.json())
app.use(userRouter)


const PORT = process.env.PORT

app.listen(PORT || '3001', () => console.log(`server Started at http://localhost:${PORT}`))
