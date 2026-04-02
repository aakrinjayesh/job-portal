// src/middleware/adminMiddleware.js
import jwt from "jsonwebtoken";

export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRETKEY);

    // if (decoded.role !== "admin") {
    //   return res.status(403).json({ status: "error", message: "Forbidden: Admins only" });
    // }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
};