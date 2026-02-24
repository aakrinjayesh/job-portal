import prisma from "../config/prisma.js";
import extractTextFromBase64 from "../utils/extractText.js";
// import { extractResumeSections } from '../utils/llmTextExtractor.js'
import { extractAIText } from "../utils/ai/extractAI.js";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import mammoth from "mammoth";
import { uploadToCloudinary } from "../utils/Storage.js";

// for uploading pdf and extracting all the details from it for both vendor and candidate

const UploadResume = async (req, res) => {
  try {
    logger.info("UploadResume API hit");

    if (!req.file) {
      logger.warn("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { role } = req.body;
    const { buffer, mimetype, originalname, size } = req.file;

    logger.info(
      `File received: ${originalname}, Type: ${mimetype}, Role: ${role}`,
    );

    let extractedText = "";

    // ✅ PDF handling
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromBase64(buffer);
      logger.info("Extracted text from PDF");
    }

    // ✅ DOCX handling
    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      logger.info("Extracted text from DOCX");
    }

    // ❌ Unsupported file
    else {
      logger.warn("Unsupported file type:", mimetype);
      return res.status(400).json({
        error: "Unsupported file type. Please upload PDF or DOCX only.",
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "Unable to extract text from the uploaded file",
      });
    }

    const structuredData = await extractAIText(extractedText, role);

    return res.status(200).json({
      message: "File received successfully",
      fileName: originalname,
      mimeType: mimetype,
      size,
      extracted: structuredData.data,
    });
  } catch (err) {
    logger.error("Error in UploadResume:", err);
    return res.status(500).json({
      error: "Something went wrong while uploading",
    });
  }
};

// add or update profile details for both vendor and candidate
const updateProfiledetails = async (req, res) => {
  try {
    logger.info("updateProfiledetails API hit");

    if (!req.body) {
      logger.warn("No body found in request");
      return res.status(400).json({ message: "No body found" });
    }

    const userFromToken = req.user;
    logger.info(`Update for user: ${userFromToken?.email}`);

    const user = await prisma.users.findUnique({
      where: { email: userFromToken.email },
    });

    if (!user) {
      logger.warn("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    const {
      profilePicture,
      name = null,
      phoneNumber = null,
      portfolioLink = null,
      email = null,
      preferredLocation = [],
      preferredJobType = [],
      currentLocation = null,
      currentCTC = null,
      expectedCTC = null,
      rateCardPerHour = {},
      joiningPeriod = null,
      totalExperience = null,
      relevantSalesforceExperience = null,
      skillsJson = [],
      primaryClouds = [],
      secondaryClouds = [],
      certifications = [],
      workExperience = [],
      education = [],
      linkedInUrl = null,
      trailheadUrl = null,
      title,
      summary = null,
    } = req.body;

    const upserted = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        profilePicture,
        name,
        phoneNumber,
        portfolioLink,
        email,
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
        rateCardPerHour,
        joiningPeriod,
        totalExperience,
        relevantSalesforceExperience,
        skillsJson,
        primaryClouds,
        secondaryClouds,
        certifications,
        workExperience,
        linkedInUrl,
        trailheadUrl,
        education,
        currentLocation,
        title,
        summary,
      },
      create: {
        userId: user.id,
        profilePicture,
        name,
        phoneNumber,
        portfolioLink,
        email,
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
        rateCardPerHour,
        joiningPeriod,
        totalExperience,
        relevantSalesforceExperience,
        skillsJson,
        primaryClouds,
        secondaryClouds,
        certifications,
        workExperience,
        education,
        currentLocation,
        linkedInUrl,
        trailheadUrl,
        title,
        summary,
        chatuserid: user.chatuserid,
      },
    });

    logger.info("Profile updated successfully", { userId: upserted.userId });

    return res.status(200).json({ status: "success", data: upserted.userId });
  } catch (err) {
    console.error("Error saving user profile:", err.message);
    return res.status(500).json({
      status: "failed",
      message: "Could not save profile" + err.message,
    });
  }
};

const getUserProfileDetails = async (req, res) => {
  try {
    logger.info("getUserProfileDetails API hit");

    const { id } = req.user;

    if (!id) {
      logger.warn("User ID missing in token");
      return res.status(400).json({ message: "User ID missing in token" });
    }

    logger.info(`Fetching profile for User ID: ${id}`);

    const user = await prisma.userProfile.findUnique({
      where: { userId: id },
    });

    if (!user) {
      logger.warn("User profile not found");
      return res
        .status(200)
        .json({ status: "failed", message: "User not found" });
    }

    logger.info("User profile fetched successfully");

    return res.status(200).json({ status: "success", user });
  } catch (error) {
    logger.error(
      "Error fetching profile:",
      JSON.stringify(error.message, null, 2),
    );
    return res
      .status(200)
      .json({ status: "error", message: "Internal server error" });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    console.log("uploadProfilePicture API hit");

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    // 🔥 Upload file object (not just buffer)
    const uploadedFile = await uploadToCloudinary(req.file);
    // const uploadedFile = await uploadToCloudinary(req.file.buffer);
    // const uploadedFile = await uploadToCloudinary(req.file.path);

    if (!uploadedFile) {
      return res.status(500).json({
        status: "error",
        message: "S3 upload failed",
      });
    }

    return res.status(200).json({
      url: uploadedFile.url, // public S3 URL
    });
  } catch (error) {
    console.error("Profile Picture Upload Error:", error);

    return res.status(500).json({
      status: "error",
      message: "Upload failed",
    });
  }
};

// company controllers

const getCompanyProfileDetails = async (req, res) => {
  try {
    logger.info("getUserProfileDetails API hit");

    const { id } = req.user;

    const user = await prisma.users.findUnique({
      where: { id }, // ✅ FIXED
      include: {
        address: true,
      },
    });

    if (!user) {
      logger.warn("User profile not found");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const [firstName = "", lastName = ""] = user.name?.split(" ") || [];

    const data = {
      name: user.name,
      email: user.email || null,
      firstName,
      lastName,
      phoneNumber: user.phoneNumber,
      companyName: user.companyName,
      profileUrl: user.profileUrl,
      address: user.address,
    };

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    logger.error(
      "Error fetching profile:",
      JSON.stringify(error.message, null, 2),
    );
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateUserProfileDetails = async (req, res) => {
  try {
    logger.info("updateUserProfileDetails API hit");

    const { id } = req.user;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Payload is missing",
      });
    }

    // 1️⃣ Check user
    const user = await prisma.users.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const {
      name,
      phoneNumber,
      companyName,
      profileUrl,
      address, // { doorNumber, street, city, state, country, pinCode }
    } = payload;

    // 2️⃣ Transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 🔹 Update Users table
      const userUpdate = await tx.users.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(companyName !== undefined && { companyName }),
          ...(profileUrl !== undefined && { profileUrl }),
        },
      });

      // 🔹 Update or Create Address
      if (address) {
        if (user.address) {
          await tx.address.update({
            where: { id: user.address.id },
            data: {
              ...(address.doorNumber !== undefined && {
                doorNumber: address.doorNumber,
              }),
              ...(address.street !== undefined && { street: address.street }),
              ...(address.city !== undefined && { city: address.city }),
              ...(address.state !== undefined && { state: address.state }),
              ...(address.country !== undefined && {
                country: address.country,
              }),
              ...(address.pinCode !== undefined && {
                pinCode: address.pinCode,
              }),
            },
          });
        } else {
          await tx.address.create({
            data: {
              userId: id,
              doorNumber: address.doorNumber || null,
              street: address.street || null,
              city: address.city || null,
              state: address.state || null,
              country: address.country || null,
              pinCode: address.pinCode || null,
            },
          });
        }
      }

      return userUpdate;
    });

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(
      "Error updating user profile:",
      JSON.stringify(error.message, null, 2),
    );
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get Countries + States (Address form)
const getCountriesWithStates = async (req, res) => {
  console.log("in get countries");
  try {
    const countries = await prisma.country.findMany({
      include: { states: true },
    });
    console.log(JSON.stringify(countries, null, 2));
    return res.json({
      status: "success",
      data: countries,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Unable to fetch countries",
    });
  }
};

// // // Save or Update Address (Upsert) for User Profile
// //  const saveOrUpdateAddress = async (req, res) => {
// //   console.log("address update start")
// //   try {
// //     const userId = req.user?.id;

// //     if (!userId) {
// //       return res.status(400).json({
// //         status: "error",
// //         message: "Invalid user ID",
// //       });
// //     }

// //     // Get user profile to fetch profileId
// //     const profile = await prisma.userProfile.findUnique({
// //       where: { userId },
// //     });

// //     if (!profile) {
// //       return res.status(404).json({
// //         status: "error",
// //         message: "User profile not found",
// //       });
// //     }

// //     const profileId = profile.id;
// //     console.log(profileId);
// //     // Dynamic frontend object (doorNo, street, countryId, stateId, pincode etc.)
// //     const addressData = req.body;
// //     console.log(addressData)
// //     // Filter undefined fields
// //     const filteredData = Object.fromEntries(
// //       Object.entries(addressData).filter(([_, v]) => v !== undefined)
// //     );

// //     // If empty — reject (user clicked save without editing anything)
// //     if (Object.keys(filteredData).length === 0) {
// //       return res.status(400).json({
// //         status: "error",
// //         message: "No address fields to update",
// //       });
// //     }

// //     // Address UPSERT
// //     const updatedAddress = await prisma.address.upsert({
// //       where: { profileId }, // ensure profileId is unique in Prisma schema
// //       update: filteredData,
// //       create: {
// //         profileId,
// //         ...filteredData,
// //       },
// //     });
// //     console.log("Updated address object:", updatedAddress);
// //         return res.json({
// //           status: "success",
// //           message: "Address saved successfully",
// //           data: updatedAddress,
// //         });
// //   } catch (error) {
// //     return res.status(500).json({
// //       status: "error",
// //       message: "Unable to save address",
// //       error: error.message,
// //     });
// //   }
// };

// Get User Address (for logged-in user)
// const getUserAddress = async (req, res) => {
//   try {
//     const userId = req.user?.id; // token is already decoded by middleware

//     if (!userId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid user ID",
//       });
//     }

//     // Find user profile to get profileId
//     const profile = await prisma.userProfile.findUnique({
//       where: { userId },
//       include: { address: true }, // include the related Address
//     });

//     if (!profile) {
//       return res.status(404).json({
//         status: "error",
//         message: "User profile not found",
//       });
//     }
//     console.log(profile)
//     // Send address (may be null if not saved)
//     return res.status(200).json({
//       data:{
//       status: "success",
//       address: profile.address || null,
//   }});
//   } catch (error) {
//     console.error("Error fetching user address:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Could not fetch user address",
//       error: error.message,
//     });
//   }
// };

export {
  UploadResume,
  updateProfiledetails,
  updateUserProfileDetails,
  getUserProfileDetails,
  getCountriesWithStates,
  uploadProfilePicture,
  getCompanyProfileDetails,
};
