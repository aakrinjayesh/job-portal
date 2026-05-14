// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     req.user = null;
//     return next();
//   }

//   jwt.verify(token, process.env.SECRETKEY, (err, user) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ code: "TOKEN_EXPIRED" });
//       }
//       return res.status(401).json({ code: "TOKEN_INVALID" });
//     }

//     req.user = user;
//     next();
//   });
// };

// export { authenticateToken };

import jwt from "jsonwebtoken";

/**
 * Verifies the JWT issued by the main backend.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    req.user = decoded; // { id, email, role, organizationId, ... }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
  // req.user = {
  //   id: "59e1231d-a54a-4a68-aa64-52761d95bc13",
  //   role: "company", // ✅ since it's a company user
  // };
  // next();
};

/**
 * Allow only users with role === "company" or "admin"
 */
export const isInstructor = (req, res, next) => {
  const { role } = req.user;
  if (role === "company" || role === "admin" || role === "candidate")
    return next();
  return res
    .status(403)
    .json({ success: false, message: "Instructor access required" });
};

/**
 * Allow only admins
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") return next();
  return res
    .status(403)
    .json({ success: false, message: "Admin access required" });
};
