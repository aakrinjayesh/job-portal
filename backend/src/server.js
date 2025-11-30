import express from "express";
import cors from 'cors'
import dotenv from 'dotenv';
import path from "path";
import userRouter from "./Routes/profileRoutes.js";
import JobRouters from "./Routes/jobRoutes.js";
import CommonRouters from "./Routes/commonRoutes.js";
import LoginRouters from "./Routes/loginRoutes.js";
import VendorRoutes from "./Routes/vendorRoutes.js";
import courseRoutes from "./Routes/course.routes.js";
import classRoutes from "./Routes/class.routes.js";
const __dirname = path.resolve();

dotenv.config();


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // <-- important for auth
  credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

 app.use( userRouter)
app.use(LoginRouters)
app.use("/api/course", courseRoutes);
app.use("/api/classes", classRoutes);
// app.use(userRouter)
app.use(JobRouters)
app.use(CommonRouters)
app.use('/vendor',VendorRoutes)

const PORT = process.env.PORT

app.listen(PORT || '3001', () => console.log(`server Started at http://localhost:${PORT}`))
