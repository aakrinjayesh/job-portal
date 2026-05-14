import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "./Middleware/authMiddleware.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import prisma from "./config/prisma.js";

dotenv.config();

const app = express();

app.use(
  cors({ origin: process.env.SOCIAL_CORS_ORIGIN || "*", credentials: true }),
);
app.use(express.json());
app.use(authenticateToken);

app.get("/health", async (_req, res) => {
  const courses = await prisma.skills.findMany();
  res.json(courses);
});

app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.SOCIAL_PORT || 3003;

app.listen(PORT, () => {
  console.log(`social-backend running on port ${PORT}`);
});
