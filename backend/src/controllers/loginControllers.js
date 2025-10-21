import generateOtp from '../utils/generateOtp.js'
import sendEmail from '../utils/sendEmail.js'
import prisma from '../config/prisma.js'
import generateToken from '../utils/generateToken.js'


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

const dummy = async (req,res) =>{
 
  try {
    const {name} = req.body
    const userFromToken = req.user
    const id = userFromToken.id
    console.log('name',name)
    const dummy = await prisma.dummy.create({
      data:{name: name, userid:id }
    })
    console.log('dummy',dummy)
    return res.status(200).json({
      status:'succces',
      dummy
    })
  } catch (error) {
    console.log('3')
    console.log('erroe',error.message)
    return res.status(200).json({
      status: 'error',
      message:`error ${error.message}`
    })
  }
}


export {
  userOtpGenerate,
  userOtpValidator,
  dummy
}