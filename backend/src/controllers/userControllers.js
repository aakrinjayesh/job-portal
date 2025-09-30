import generateToken from '../utils/generateToken.js'
import prisma from '../config/prisma.js'
// import bcrypt from 'bcrypt'
import generateOtp from '../utils/generateOtp.js'
import sendEmail from '../utils/sendEmail.js'
import extractTextFromBase64 from '../utils/extractText.js'
import { extractResumeSections } from '../utils/llmTextExtractor.js'


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
      currentCTC = null,
      expectedCTC = null,
      joiningPeriod = null,
      totalExperience = null,
      relevantSalesforceExperience = null,
      skills = [],
      certifications = [],
      workExperience = []
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
        skills,
        certifications,
        workExperience
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
        skills,
        certifications,
        workExperience
      }
    })

    return res.status(200).json({ status: 'success', data: upserted.userId })
  } catch (err) {
    console.error('Error saving user profile:', err)
    return res.status(500).json({ status: 'failed', message: 'Could not save profile' })
  }
}

const otpStore = new Map();


const userOtpGenerate = async (req,res)=>{
  try{
    const { email } = req.body
    let user = await prisma.users.findUnique({ where: { email } })

    if (!user) {
      const name = email.split("@")[0];
      const create_email = await prisma.users.create({
        data: {
          name,
          email,
        }
      })
    }

    const GenerateOtp = generateOtp()
    otpStore.set(email, GenerateOtp);

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
    console.log('validate otp')
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

    const savedOtp = otpStore.get(email);

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

export { 
  // userRegister, userLogin, 
  userUploadTicket, userProfiledetails,userOtpGenerate,userOtpValidator }