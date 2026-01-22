import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
  console.log("inside middleware")
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(403).json({ message: "Missing access token" })
  }
  jwt.verify(token, process.env.SECRETKEY , (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" + err.message });
    }
    console.log("user from middleware", user)
    // req.body = user
    req.user = user
    next()
  })
}

export {
  authenticateToken
}