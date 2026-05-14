import express from "express";
import { createPost, likePost, getPostLikes,commentPost, getComments,getShareSuggestions,sendPostToUser, getPostById, uploadPostMedia,repostPost} from "../controllers/postController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
// import { upload } from "../Middleware/upload.middleware.js";
import multer from "multer";
 
const postRoutes = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // memory for S3

postRoutes.post("/upload-media", authenticateToken, upload.array("files", 10), uploadPostMedia);
postRoutes.post("/", authenticateToken, createPost); // no multer needed now
 
// multipart/form-data — up to 10 files in the "media" field
// postRoutes.post("/", authenticateToken, upload.array("media", 10), createPost);
postRoutes.post("/like", authenticateToken, likePost);
postRoutes.get("/:postId/likes", authenticateToken, getPostLikes);
postRoutes.post("/repost", authenticateToken, repostPost);
// postRoutes.post("/unlike", authenticateToken, unlikePost);
postRoutes.post("/comment", authenticateToken, commentPost);
postRoutes.get("/:postId/comments", authenticateToken, getComments);
postRoutes.get("/:postId/share-suggestions", authenticateToken, getShareSuggestions);
postRoutes.post("/send", authenticateToken, sendPostToUser);
postRoutes.get("/:postId", authenticateToken, getPostById);
 
export default postRoutes;