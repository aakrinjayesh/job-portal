import express from "express";
import {
  createPromoCode,
  listPromoCodes,
  togglePromoCode,
} from "../../admin/controllers/promoController.js";
import { verifyAdminToken } from "../middleware/adminMiddleware.js";

const AdminPromoRoute = express.Router();

// Admin routes — add your isAdmin middleware here when ready
AdminPromoRoute.post("/promo/create", verifyAdminToken, createPromoCode);
AdminPromoRoute.get("/promo/list", verifyAdminToken, listPromoCodes);
AdminPromoRoute.patch("/promo/:id/toggle", verifyAdminToken, togglePromoCode);

export default AdminPromoRoute;
