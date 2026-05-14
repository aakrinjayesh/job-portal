import multer from "multer";
import path from "path";
 
const storage = multer.diskStorage({
  destination: "uploads/", // or use memoryStorage() + upload to S3/Cloudinary
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
 
// export const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
//   fileFilter: (_req, file, cb) => {
//     const allowed = /image|video|pdf|msword|officedocument/;
//     cb(null, allowed.test(file.mimetype));
//   },
// });