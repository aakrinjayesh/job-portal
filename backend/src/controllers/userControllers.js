import generateToken from '../utils/generateToken.js'
import prisma from '../config/prisma.js'
// import bcrypt from 'bcrypt'
import generateOtp from '../utils/generateOtp.js'
import sendEmail from '../utils/sendEmail.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'
import { success } from 'zod'


// const userRegister = async (req, res) => {
//   console.log('inside regester')
//   try {
//     const { name, email } = req.body
//     // const hashedpassword = await bcrypt.hash(password, 5)
//     const user = await prisma.users.findUnique({
//       where: {
//         email: email
//       }
//     })
//     if(!user){
//       const newAdmin = await prisma.users.create({
//         data: {
//           name,
//           email,
//         }
//       })
//       console.log("newAdmin", newAdmin)
  
//       res.status(200).json({
//         status: 'success',
//         message: "User registered successfully",
//       })
//     } else{
//       res.status(200).json({
//         status: 'failed',
//         message: "User already Registered",
//       })
//     }
//   } catch (err) {
//     console.error("Error in AdminRegister:", err);
//     res.status(400).json({
//       status: "failed",
//       message: "User already Exist"
//     })
//   }

// }

// const userLogin = async (req, res) => {
//   try {
//     const { email,  } = req.body

//     const Adminexists = await prisma.users.findUnique({
//       where: {
//         email: email
//       }
//     })

//     if (!Adminexists) {
//       return res.status(400).json({ message: "User doesn't exists" });
//     }
    
//     const checkcredientials = Adminexists
//     console.log('checkcredientials', checkcredientials)
//     if (!checkcredientials) {
//       return res.status(401).json({
//         status: "failed",
//         message: "Invalid Credentials"
//       })
//     }
//     const accessToken = generateToken(Adminexists)
//     console.log('accesstoken', accessToken)
   
//     res.status(200).json({
//       status: "success",
//       message: "successfully logged in",
//       token: accessToken
//       // resp_object: {
//       //   _id: Adminexists.id,
//       //   email: Adminexists.email,
//       //   token: accessToken
//       // }
//     })

//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message
//     })
//   }
// }



const userUploadTicket = async (req, res) => {
  try {
    console.log('inside file');

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfBuffer = req.file.buffer;
    
    const text = await extractTextFromBase64(pdfBuffer)

    const structuredData = await extractResumeSections(text);

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

const userProfiledetails = async (req, res) => {
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

const otpStore = new Map();


const userOtpGenerate = async (req,res)=>{
  try{
    const { email, role } = req.body
    let user = await prisma.users.findUnique({ where: { email } })

    if (!user) {
      const name = email.split("@")[0];
      const create_email = await prisma.users.create({
        data: {
          name,
          email,
          role,
        }
      })
    }

    const GenerateOtp = generateOtp()
    otpStore.set(email, GenerateOtp);
    console.log('otp store',otpStore)

    sendEmail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your verification code is ${GenerateOtp}`
    })

    return res.status(200).json({ status: 'success', message: 'OTP sent to email' })
  }catch(err){
    return res.status(400).json({ status: 'failed', message: err.message })
  }
}

const userOtpValidator = async (req,res) => {
  try {
    const { email, otp } = req.body;
    console.log('validate otp',req.body)
    console.log('email',email)
    console.log('otp',otp)
    if(!email || !otp){
      return res.status(401).json({
        status: "failed",
        message: "Send all credentials",
      });
    }

    let user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Something went Wrong",
      });
    }
    console.log('store',otpStore)
    const savedOtp = otpStore.get(email);
    console.log("savedotp store", savedOtp)

    if (!savedOtp) {
      return res.status(400).json({ status: 'failed', message: 'No OTP found. Please request again.' });
    }

    if (otp === savedOtp) {
      otpStore.delete(email); // clear OTP once used

      const accessToken = generateToken(user);
      return res.status(200).json({
        status: 'success',
        message: 'Successfully logged in',
        token: accessToken,
         role: user.role,
      });
    } else {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid OTP',
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
}


// Fetch all Skills
const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skills.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({ status: 'success', data: skills });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

// Fetch all Certifications
const getAllCertifications = async (req, res) => {
  try {
    const certifications = await prisma.certification.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', data: certifications });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
};

// Fetch all Locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', data: locations });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
};

const updateSkills = async (req, res) => {
  const { name } = req.body;
  if(!name){
    return res.status(200).json({ status:'failed', message: "Skill name is required" });
  }
  try {
    const check = await prisma.skills.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Skill already exists" });
    }
    const newSkill = await prisma.skills.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    res.status(200).json({success:'failed', message: "Skill already exists or something went wrong" });
  }
}

const updateCertifications = async (req, res) => {
  const { name } = req.body;
  if(!name){
   return res.status(200).json({ status:'failed', message: "Certification name is required" });
  }
  try {
    const check = await prisma.certification.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Certification already exists" });
    }
    const newSkill = await prisma.certification.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    return res.status(200).json({status: 'failed', message: "Certification already exists or something went wrong" });
  }
}

const updateLocation = async (req, res) => {
  const { name } = req.body;
  if(!name){
    return res.status(200).json({ status:'failed', message: "Location name is required" });
  }
  try {
    const check = await prisma.location.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Location already exists" });
    }
    const newSkill = await prisma.location.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    return res.status(200).json({status:'failed', message: "Location already exists or something went wrong" });
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

// Fetch all Clouds
const getAllClouds = async (req, res) => {
  try {
    const clouds = await prisma.cloud.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ status: 'success', data: clouds });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

// Add a cloud
const addCloud = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(200).json({ status: 'failed', message: "Cloud name is required" });
  }
  try {
    const check = await prisma.cloud.findUnique({ where: { name } });
    if (check) {
      return res.status(200).json({ status: 'failed', message: "Cloud already exists" });
    }
    const newCloud = await prisma.cloud.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    return res.status(200).json({ status: 'failed', message: "Cloud already exists or something went wrong" });
  }
};

const getJobList = async () =>{
  try {
    const jobs = prisma.jobList.findMany({
        select : {
          id,          
          title, 
          company,
          rating ,
          reviews,
          experience,
          location,
          description,
          skills,
          posted      
        }
    })
    return res.status(200).json({
      status:"success",
      jobs
    })
    
  } catch (error) {
    console.error("joblist Route Error:", err);
      return res.status(500).json({
        status: "failed",
        error: err.message || "Internal server error",
      })
  }
}



export { 
  // userRegister, userLogin, 
  userUploadTicket, userProfiledetails,userOtpGenerate,userOtpValidator, getAllSkills, getAllCertifications, getAllLocations, updateSkills, updateCertifications, updateLocation, getUserProfileDetails,getAllClouds, addCloud, getJobList }