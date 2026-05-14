// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { authenticateToken } from "./Middleware/authMiddleware.js";
// import courseRoutes from "./routes/courseRoutes.js";
// import classRoutes from "./routes/classRoutes.js";
// import reviewRoutes from "./routes/reviewRoutes.js";

// dotenv.config();

// const app = express();

// app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
// app.use(express.json());
// app.use(authenticateToken);

// app.get("/health", (_req, res) =>
//   res.json({ status: "ok", service: "course-backend" }),
// );

// app.use("/api/courses", courseRoutes);
// app.use("/api/classes", classRoutes);
// app.use("/api/reviews", reviewRoutes);

// const PORT = process.env.COURSE_PORT || 3002;

// app.listen(PORT, () => {
//   console.log(`course-backend running on port ${PORT}`);
// });
import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import courseRoutes from "./routes/courseRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.COURSE_CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────
// Course CRUD, sections, lectures, S3 upload URLs
app.use("/api/courses", courseRoutes);

// Enrollment, cart, wishlist, lecture progress
app.use("/api/class", classRoutes);

// Assessment, attempts, certificates
app.use("/api/review", reviewRoutes);

// Health check
app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "course-backend" }),
);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[course-backend error]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.COURSE_PORT || 3002;
app.listen(PORT, () => console.log(`course-backend running on port ${PORT}`));
