import express from "express";
import { getJobSEOMeta } from "../controllers/seoController";

const seoRoute = express.Router();

// Public — no auth needed
seoRoute.get("/api/seo/job/:jobId", getJobSEOMeta);

export default seoRoute;
