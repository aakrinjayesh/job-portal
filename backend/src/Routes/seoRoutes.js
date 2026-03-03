import express from "express";
import { getJobSEOMeta, sitemap } from "../controllers/seoController.js";

const seoRoute = express.Router();

seoRoute.get("/api/seo/job/:jobId", getJobSEOMeta);
seoRoute.get("/sitemap.xml", sitemap);

export default seoRoute;
