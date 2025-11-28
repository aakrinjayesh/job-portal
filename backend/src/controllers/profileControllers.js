import prisma from '../config/prisma.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'
import fs from "fs";
import path from "path";





// for uploading pdf and extracting all the details from it for both vendor and candidate
const UploadResume = async (req, res) => {
  try {
    console.log('inside file');
 
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { role } = req.body;
 
    const pdfBuffer = req.file.buffer;
   
    const text = await extractTextFromBase64(pdfBuffer)
 
    const structuredData = await extractResumeSections(text,role);
 
    res.status(200).json({
      message: "File received successfully",
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
       extracted: structuredData,
    });
 
  } catch (err) {
    console.error("Error in userUploadTicket:", err);
    res.status(500).json({ error: "Something went wrong while uploading" });
  }
};

// add or update profile details for both vendor and candidate
const updateProfiledetails = async (req, res) => {
  try {
    console.log('inisde user profile update')
    if(!req.body){
      return res.status(400).json({ message: "No body found" })
    }
    const userFromToken = req.user
    // if (!userFromToken?.email) {
    //   return res.status(401).json({ message: "Unauthorized" })
    // }

    const user = await prisma.users.findUnique({ where: { email: userFromToken.email } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const {

      profilePicture,
      name = null,
      phoneNumber = null,
      portfolioLink = null,
      email= null,
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
        name ,
        phoneNumber ,
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
         name ,
      phoneNumber ,
      portfolioLink ,
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
    console.log('upded db useeprofile',upserted);
    return res.status(200).json({ status: 'success', data: upserted.userId })
  } catch (err) {
    console.error('Error saving user profile:', err)
    return res.status(500).json({ status: 'failed', message: 'Could not save profile' })
  }
}



const getUserProfileDetails = async (req, res) => {
  try {
    // The JWT middleware puts user info here
    const { id } = req.user;  

    if (!id) {
      return res.status(400).json({ message: "User ID missing in token" });
    }

    // Fetch user details from DB
    const user = await prisma.userProfile.findUnique({
      where: { userId: id }
    });
      console.log("useers data", user)
    if (!user) {
      return res.status(200).json({ status: "failed", message: "User not found" });
    }

    return res.status(200).json({ success: "true", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(200).json({status: "failed", message: "Internal server error" });
  }
};

// NEW: Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log("📸 Upload API hit. File:", req.file);

    if (!req.file) {
      return res.status(400).json({
        status: "failed",
        message: "No file uploaded",
      });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const savePath = path.join(uploadDir, fileName);
    fs.writeFileSync(savePath, req.file.buffer);

    const fileUrl = `${process.env.BASE_URL}/uploads/${fileName}`;

    return res.status(200).json({
      status: "success",
      url: fileUrl,
    });

  } catch (error) {
    console.error("Profile Picture Upload Error:", error);
    return res.status(500).json({
      status: "failed",
      message: "Upload failed",
    });
  }
};

export { 
  // userRegister, userLogin, 
  UploadResume, updateProfiledetails, getUserProfileDetails,uploadProfilePicture}