import jwt from 'jsonwebtoken'



const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRETKEY)
}

export default generateToken;