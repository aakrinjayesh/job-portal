import express from "express";
import {
  createCompany,
  uploadCompaniesFromJson,
  uploadCompaniesMiddleware,
} from "../controllers/adminCompanyController.js";
import { verifyAdminToken } from "../middleware/adminMiddleware.js";

const AdminCompanyRouter = express.Router();

// 🔐 Protected - Admin only

// ✅ Create Company (Org + CompanyProfile)
AdminCompanyRouter.post("/companies/create", verifyAdminToken, createCompany);
// 🔥 BULK UPLOAD ROUTE
AdminCompanyRouter.post(
  "/companies/upload-json",
  verifyAdminToken,
  uploadCompaniesMiddleware,
  uploadCompaniesFromJson,
);

export default AdminCompanyRouter;
