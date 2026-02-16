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
//       folder: "profile",
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

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(fileBuffer);
  });
};
