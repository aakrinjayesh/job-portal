import prisma from '../config/prisma.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'





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
      preferredLocation = [],
      preferredJobType = [],
      currentLocation = null,
      currentCTC = null,
      expectedCTC = null,
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
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
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
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
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
    console.log('upded db useeprofile',upserted)
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





export { 
  // userRegister, userLogin, 
  UploadResume, updateProfiledetails, getUserProfileDetails}