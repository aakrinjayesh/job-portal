import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create folder if not exists
function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Dynamic multer storage
function createMulter(folderName, allowedTypes) {
  const uploadPath = path.join(__dirname, "..", "uploads", folderName);
  ensureFolder(uploadPath);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  return multer({ storage, fileFilter });
}

// VIDEO Upload
const uploadVideo = createMulter("videos", [
  "video/mp4",
  "video/mkv",
  "video/webm",
  "video/quicktime",
]);

// IMAGE Upload
const uploadImage = createMulter("images", [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
]);

// DOCUMENT Upload
const uploadDocument = createMulter("docs", [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// ⭐ EXPORT DEFAULT (ESM)
export default {
  uploadVideo,
  uploadImage,
  uploadDocument,
};
