import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import prisma from "./config/prisma.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());

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
