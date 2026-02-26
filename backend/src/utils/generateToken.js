import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRETKEY, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.R_SECRETKEY, {
    expiresIn: "90d",
  });
};

export default generateToken;
