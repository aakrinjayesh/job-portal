import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.SECRETKEY, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ code: "TOKEN_INVALID" });
    }

    req.user = user;
    next();
  });
};

export { authenticateToken };
