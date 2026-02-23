// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const uploadToCloudinary = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: "profile",
//         resource_type: "image",
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary Upload Error:", error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       },
//     );

//     stream.end(fileBuffer);
//   });
// };

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToCloudinary = async (file) => {
  try {
    const fileBuffer = file.buffer;
    const fileName = file.originalname;
    const mimeType = file.mimetype;
    const uniqueFileName = `profile/${uuidv4()}-${fileName}`;

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
