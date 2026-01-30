import express from "express";
import {
  getAllTodo,
  createTodo,
  editTodo,
  deleteTodo,
  toggleActiveTodo,
  getCandidateTasks,
  checkUpdate,
} from "../controllers/todoController.js";

import { authenticateToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Get all recruiter template tasks
router.get("/all", authenticateToken, getAllTodo);

// Create new template task
router.post("/create", authenticateToken, createTodo);

// Edit template task title
router.post("/edit", authenticateToken, editTodo);

// Delete template task
router.post("/delete", authenticateToken, deleteTodo);

// Toggle active/inactive
router.patch("/active", authenticateToken, toggleActiveTodo);

// Get checklist for candidate + job (auto-creates if missing)
router.post("/candidate", authenticateToken, getCandidateTasks);

// Check / uncheck task
router.patch("/candidate/check", authenticateToken, checkUpdate);

export default router;
