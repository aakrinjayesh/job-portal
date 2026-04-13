import express from "express";
import { authenticateToken } from "../Middleware/authMiddleware.js";

import {
  getCompaniesList,
  getCompanyDetails,
} from "../controllers/companyControllers.js";

const companyRouter = express.Router();

// 🔹 Public - Get all companies
companyRouter.get("/list", getCompaniesList);

// 🔹 Public - Get company details by slug
companyRouter.get("/public/:slug", getCompanyDetails);

export default companyRouter;
