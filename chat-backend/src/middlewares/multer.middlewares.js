import multer from "multer";

// memoryStorage keeps file in RAM and populates file.buffer
// (diskStorage does NOT populate file.buffer, causing 0-byte S3 uploads)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1000 * 1000, // 10 MB
  },
});
