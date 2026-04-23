import express from "express";
import {
  createPromoCode,
  listPromoCodes,
  togglePromoCode,
  editPromoCode,
} from "../../admin/controllers/promoController.js";
import { verifyAdminToken } from "../middleware/adminMiddleware.js";

const AdminPromoRoute = express.Router();

// Admin routes — add your isAdmin middleware here when ready
AdminPromoRoute.post("/promo/create", verifyAdminToken, createPromoCode);
AdminPromoRoute.get("/promo/list", verifyAdminToken, listPromoCodes);
AdminPromoRoute.patch("/promo/:id/toggle", verifyAdminToken, togglePromoCode);
AdminPromoRoute.patch("/promo/:id", verifyAdminToken, editPromoCode);

export default AdminPromoRoute;
