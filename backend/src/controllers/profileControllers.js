import prisma from '../config/prisma.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'

//generate otp to validate phone number of user




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
      email,
      firstName,
      lastName,
      companyName=null,
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
        firstName,
        lastName,
        companyName,
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
        firstName,
        lastName,
        companyName, 
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
    console.log('upded db useeprofile',upserted)
    return res.status(200).json({ status: 'success', data: upserted.userId })
  } catch (err) {
    console.error('Error saving user profile:', err)
    return res.status(500).json({ status: 'failed', message: 'Could not save profile' })
  }
}



const getUserProfileDetails = async (req, res) => {
  console.log("in user profile",req.user)
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

//--------------------------------------
// Get Countries + States (Address form)
// --------------------------------------
 const getCountriesWithStates = async (req, res) => {
  console.log("in get countries")
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
      status: "failed",
      message: "Unable to fetch countries",
    });
  }
};
// -------------------------------------------------------
// Save or Update Address (Upsert) for User Profile
// -------------------------------------------------------
 const saveOrUpdateAddress = async (req, res) => {
  console.log("address update start")
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid user ID",
      });
    }

    // Get user profile to fetch profileId
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        status: "failed",
        message: "User profile not found",
      });
    }

    const profileId = profile.id;
 console.log(profileId);
    // Dynamic frontend object (doorNo, street, countryId, stateId, pincode etc.)
    const addressData = req.body;
 console.log(addressData)
    // Filter undefined fields
    const filteredData = Object.fromEntries(
      Object.entries(addressData).filter(([_, v]) => v !== undefined)
    );

    // If empty — reject (user clicked save without editing anything)
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "No address fields to update",
      });
    }

    // Address UPSERT
    const updatedAddress = await prisma.address.upsert({
      where: { profileId }, // ensure profileId is unique in Prisma schema
      update: filteredData,
      create: {
        profileId,
        ...filteredData,
      },
    });
 console.log("Updated address object:", updatedAddress);
    return res.json({
      status: "success",
      message: "Address saved successfully",
      data: updatedAddress,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to save address",
      error: error.message,
    });
  }
};
// --------------------------------------
// Get User Address (for logged-in user)
// --------------------------------------
const getUserAddress = async (req, res) => {
  try {
    const userId = req.user?.id; // token is already decoded by middleware

    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid user ID",
      });
    }

    // Find user profile to get profileId
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { address: true }, // include the related Address
    });

    if (!profile) {
      return res.status(404).json({
        status: "failed",
        message: "User profile not found",
      });
    }
 console.log(profile)
    // Send address (may be null if not saved)
    return res.status(200).json({
      data:{
      status: "success",
      address: profile.address || null,
  }});
  } catch (error) {
    console.error("Error fetching user address:", error);
    return res.status(500).json({
      status: "failed",
      message: "Could not fetch user address",
      error: error.message,
    });
  }
};


export { 
  // userRegister, userLogin, 
  UploadResume, updateProfiledetails, getUserProfileDetails,getCountriesWithStates,saveOrUpdateAddress,getUserAddress}