// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const uploadToCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto", // auto detects image, pdf, doc, etc.
//       folder: "chat",
//     });

//     // remove file from local after upload
//     fs.unlinkSync(localFilePath);

//     return response;
//   } catch (error) {
//     console.error("Cloudinary Upload Error:", error);

//     // delete local file if upload fails
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     return null;
//   }
// };

// export const deleteFromCloudinary = async (
//   public_id,
//   resource_type = "image",
// ) => {
//   try {
//     return await cloudinary.uploader.destroy(public_id, {
//       resource_type,
//     });
//   } catch (error) {
//     console.error("Cloudinary Delete Error:", error.message);
//     throw error;
//   }
// };

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (file) => {
  try {
    const fileBuffer = file.buffer;
    const fileName = file.originalname;
    const mimeType = file.mimetype;
    console.log("mimetype", mimeType);
    // const uniqueFileName = `chat/${fileName}-${uuidv4()}`;
    const uniqueFileName = `chat/${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    const response = await s3.send(command);

    console.log("✅ S3 Upload Success");
    console.log("S3 Response:", response);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    console.log("file Url", fileUrl);
    return {
      success: true,
      url: fileUrl,
      key: uniqueFileName,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};

export const deleteFromS3 = async (fileKey) => {
  try {
    if (!fileKey) {
      throw new Error("File key is required for deletion");
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3.send(command);

    console.log("🗑️ S3 Delete Success");
    console.log("Deleted Key:", fileKey);
    console.log("S3 Response:", response);

    return {
      success: true,
      message: "File deleted successfully",
      key: fileKey,
    };
  } catch (error) {
    console.error("❌ S3 Delete Error:", error);
    throw error;
  }
};
