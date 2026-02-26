import express from "express";
import { getJobSEOMeta } from "../controllers/seoController.js";

const seoRoute = express.Router();

seoRoute.get("/api/seo/job/:jobId", getJobSEOMeta);

export default seoRoute;
