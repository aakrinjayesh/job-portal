import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "./Middleware/authMiddleware.js";
import courseRoutes from "./routes/courseRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(authenticateToken);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "course-backend" }),
);

app.use("/api/courses", courseRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.COURSE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`course-backend running on port ${PORT}`);
});
