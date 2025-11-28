import nodemailer from 'nodemailer'

const sendEmail = (options) => {

  const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: process.env.SENDEREMAIL,
      pass: process.env.SENDERPASS
    },
    // tls: {
    //   rejectUnauthorized: false
    // },
    debug: true, // show debug output
    logger: false // log information in console
  });

  const mailOptions = {
    from: 'vsaijayesh94@gmail.com',
    // to: options?.to,
    // subject: options?.subject,
    // text: options?.text
    ...options
  }
  transporter.sendMail(mailOptions)
}

export default sendEmail