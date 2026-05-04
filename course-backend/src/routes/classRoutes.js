import { Router } from "express";
import {
  getClassesByCourse,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";

const router = Router();

router.get("/course/:courseId", getClassesByCourse);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
