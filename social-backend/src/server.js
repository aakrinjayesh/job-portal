import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { authenticateToken } from "./Middleware/authMiddleware.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import prisma from "./config/prisma.js";
import userRoutes from "./routes/userRoutes.js";
import followRoutes from "./routes/followRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
  cors({ origin: process.env.SOCIAL_CORS_ORIGIN || "*", credentials: true }),
);
app.use(express.json());
// app.use("/uploads", express.static(join(__dirname, "../uploads")));
app.use(authenticateToken);

app.get("/health", async (_req, res) => {
  const courses = await prisma.skills.findMany();
  res.json(courses);
});

app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/users", userRoutes);
app.use("/api",followRoutes);

const PORT = process.env.SOCIAL_PORT || 3003;

app.listen(PORT, () => {
  console.log(`social-backend running on port ${PORT}`);
});
