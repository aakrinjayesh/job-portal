const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000)
  return String(otp)
}

export default generateOtp

