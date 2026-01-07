// routes/vendorRouter.js
import express from "express";
import {
  getVendorCandidates,
  createVendorCandidate,
  updateVendorCandidate,
  deleteVendorCandidate,
   updateCandidateStatus ,
   getAllCandidates,
  vendorApplyCandidate,
  saveCandidate,
  unsaveCandidate,
  getSavedCandidates,
  markCandidateReviewed
} from "../controllers/vendorControllers.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";
 
const VendorRoutes = express.Router();
 


// ✅ Routes
VendorRoutes.get("/candidates", authenticateToken, getVendorCandidates);
VendorRoutes.post("/candidate/create", authenticateToken, createVendorCandidate);
VendorRoutes.post("/candidate/save",authenticateToken,saveCandidate);
VendorRoutes.post("/candidate/unsave",authenticateToken,unsaveCandidate);
VendorRoutes.get("/candidate/saved",authenticateToken,getSavedCandidates);
 
// ✅ Add update route
VendorRoutes.post(
  "/candidate/update",
  authenticateToken,
  updateVendorCandidate
);

VendorRoutes.post(
  "/candidate/mark-reviewed",
  authenticateToken,
  markCandidateReviewed
);


 
VendorRoutes.post("/candidate/delete", authenticateToken, deleteVendorCandidate);


VendorRoutes.post(
  "/candidate/update-status",
  authenticateToken,
  updateCandidateStatus
);

VendorRoutes.post(
  "/candidates/all",
  authenticateToken,
  getAllCandidates
);

VendorRoutes.post("/apply-candidate",authenticateToken,vendorApplyCandidate);


export default VendorRoutes;