import { getCourseWithClasses,createClass,updateClass,deleteClass,deleteMulterFile} from "../controllers/class.controller.js"
import { authenticateToken } from "../Middleware/authMiddleware.js";
import multerConfig from "../Middleware/multer.js";
import express from "express";
const router = express.Router();

router.get("/all", authenticateToken, getCourseWithClasses);
router.post("/createClass",authenticateToken,createClass);
router.post("/UpdateClass/:classId",authenticateToken,updateClass)
router.delete("/deleteClass/:classId", deleteClass);
router.delete("/file",deleteMulterFile);
export default router;