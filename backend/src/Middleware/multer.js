import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function createMulter(folderName, allowedTypes) {
  const uploadPath = path.join(__dirname, "..", "uploads", folderName);
  ensureFolder(uploadPath);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  };

  return multer({ storage, fileFilter });
}

// Export
export default {
  uploadVideo: createMulter("videos", ["video/mp4","video/mkv","video/webm","video/quicktime"]),
  uploadImage: createMulter("images", ["image/jpeg","image/png","image/jpg","image/webp"]),
  uploadPdf: createMulter("docs", ["application/pdf"]),
};
