import jwt from 'jsonwebtoken'



const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRETKEY,{
    expiresIn: "10m",
  })
}


export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.R_SECRETKEY,{
    expiresIn: "30d",
  });
}

export default generateToken;