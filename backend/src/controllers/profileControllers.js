import prisma from '../config/prisma.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'
import fs from "fs";
import path from "path";
import { logger } from '../utils/logger.js';



// for uploading pdf and extracting all the details from it for both vendor and candidate
const UploadResume = async (req, res) => {
  try {
    logger.info("UploadResume API hit");

    if (!req.file) {
      logger.warn("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { role } = req.body;
    logger.info(`File received: ${req.file.originalname}, Role: ${role}`);

    const pdfBuffer = req.file.buffer;
    const text = await extractTextFromBase64(pdfBuffer)

    logger.info("Extracted text from PDF");

    const structuredData = await extractResumeSections(text, role);
    res.status(200).json({
      message: "File received successfully",
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extracted: structuredData,
    });

  } catch (err) {
    logger.error("Error in UploadResume:", JSON.stringify(err.message,null,2));
    res.status(500).json({ error: "Something went wrong while uploading" });
  }
};



// add or update profile details for both vendor and candidate
const updateProfiledetails = async (req, res) => {
  try {
    logger.info("updateProfiledetails API hit");

    if (!req.body) {
      logger.warn("No body found in request");
      return res.status(400).json({ message: "No body found" })
    }

    const userFromToken = req.user
    logger.info(`Update for user: ${userFromToken?.email}`);

    const user = await prisma.users.findUnique({ where: { email: userFromToken.email } })

    if (!user) {
      logger.warn("User not found in DB");
      return res.status(404).json({ message: "User not found" })
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
    } = req.body

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
      }
    })

    logger.info("Profile updated successfully", { userId: upserted.userId });

    return res.status(200).json({ status: 'success', data: upserted.userId })

  } catch (err) {
    logger.error("Error saving user profile:", JSON.stringify(err.message,null,2));
    return res.status(500).json({ status: 'failed', message: 'Could not save profile' })
  }
}



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
      where: { userId: id }
    });

    if (!user) {
      logger.warn("User profile not found");
      return res.status(200).json({ status: "failed", message: "User not found" });
    }

    logger.info("User profile fetched successfully");

    return res.status(200).json({ success: "true", user });

  } catch (error) {
    logger.error("Error fetching profile:", JSON.stringify(error.message,null,2));
    return res.status(200).json({ status: "failed", message: "Internal server error" });
  }
};

// NEW: Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    logger.info("uploadProfilePicture API hit");

    if (!req.file) {
      logger.warn("No file uploaded for profile picture");
      return res.status(400).json({
        status: "failed",
        message: "No file uploaded",
      });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      logger.info("Uploads directory created");
    }

    const savePath = path.join(uploadDir, fileName);
    fs.writeFileSync(savePath, req.file.buffer);
    logger.info("Profile picture saved to disk");

    const fileUrl = `${process.env.BASE_URL}/uploads/${fileName}`;

    return res.status(200).json({
      status: "success",
      url: fileUrl,
    });

  } catch (error) {
    logger.error("Profile Picture Upload Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({
      status: "failed",
      message: "Upload failed",
    });
  }
};

export {
  UploadResume,
  updateProfiledetails,
  getUserProfileDetails,
  uploadProfilePicture
}
