import prisma from '../config/prisma.js'
import { logger } from '../utils/logger.js';




// Fetch all Skills
const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skills.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({ status: 'success', data: skills });
  } catch (err) {
    logger.error("getAllSkills Error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateSkills = async (req, res) => {
  const { name } = req.body;
  if(!name){
    logger.warn("Skill name missing");
    return res.status(400).json({ status:'error', message: "Skill name is required" });
  }
  try {
    const check = await prisma.skills.findUnique({ where: { name } });
    if(check){
      logger.warn(`Skill already exists: ${name}`);
      return res.status(409).json({ status:'error', message: "Skill already exists" });
    }
    const newSkill = await prisma.skills.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({status:'success', id: newSkill.id });
  } catch (error) {
    logger.error("updateSkills Error:", JSON.stringify(error.message,null,2));
    res.status(500).json({status:'error', message: `Something Went Wrong ${error.message}` });
  }
}

// Fetch all Certifications
const getAllCertifications = async (req, res) => {
  try {
    const certifications = await prisma.certification.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', data: certifications });
  } catch (err) {
    logger.error("getAllCertifications Error:", JSON.stringify(err.message,null,2));
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateCertifications = async (req, res) => {
  const { name } = req.body;
  if(!name){
    logger.warn("Certification name missing");
    return res.status(400).json({ status:'error', message: "Certification name is required" });
  }
  try {
    const check = await prisma.certification.findUnique({ where: { name } });
    if(check){
      logger.warn(`Certification already exists: ${name}`);
      return res.status(409).json({ status:'error', message: "Certification already exists" });
    }
    const newSkill = await prisma.certification.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({status:'success', id: newSkill.id });
  } catch (error) {
    logger.error("updateCertifications Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({status: 'error', message: `Something Went Wrong: ${error.message}` });
  }
}

// Fetch all Locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', data: locations });
  } catch (err) {
    logger.error("getAllLocations Error:", JSON.stringify(err.message,null,2));
    res.status(500).json({ status: 'error', message: err.message });
  }
};


const updateLocation = async (req, res) => {
  const { name } = req.body;
  if(!name){
    logger.warn("Location name missing");
    return res.status(400).json({ status:'error', message: "Location name is required" });
  }
  try {
    const check = await prisma.location.findUnique({ where: { name } });
    if(check){
      logger.warn(`Location already exists: ${name}`);
      return res.status(409).json({ status:'error', message: "Location already exists" });
    }
    const newSkill = await prisma.location.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({status:'success', id: newSkill.id });
  } catch (error) {
    logger.error("updateLocation Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({status:'error', message: `something went wrong ${error.message}` });
  }
}



// Fetch all Clouds
const getAllClouds = async (req, res) => {
  try {
    const clouds = await prisma.cloud.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ status: 'success', data: clouds });
  } catch (err) {
    logger.error("getAllClouds Error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Add a cloud
const addCloud = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    logger.warn("Cloud name missing");
    return res.status(400).json({ status: 'error', message: "Cloud name is required" });
  }
  try {
    const check = await prisma.cloud.findUnique({ where: { name } });
    if (check) {
      logger.warn(`Cloud already exists: ${name}`);
      return res.status(409).json({ status: 'error', message: "Cloud already exists" });
    }
    const newCloud = await prisma.cloud.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    logger.error("addCloud Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({ status: 'error', message: `something went wrong ${error.message}` });
  }
};


const getAllRole = async (req, res) => {
  try {
    const roles = await prisma.companyRole.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ status: 'success', data: roles });
  } catch (err) {
    logger.error("getAllRole Error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Add a cloud
const addRole = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    logger.warn("Role name missing");
    return res.status(400).json({ status: 'error', message: "Role name is required" });
  }
  try {
    const check = await prisma.companyRole.findUnique({ where: { name } });
    if (check) {
      logger.warn(`Role already exists: ${name}`);
      return res.status(409).json({ status: 'error', message: "Role already exists" });
    }
    const newCloud = await prisma.companyRole.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    logger.error("addRole Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({ status: 'error', message: `something went wrong ${error.message}` });
  }
};


const getAllQualification = async (req, res) => {
  try {
    const qualification = await prisma.qualification.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ status: 'success', data: qualification });
  } catch (err) {
    logger.error("getAllQualification Error:", JSON.stringify(err.message,null,2));
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Add a cloud
const addQualification = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    logger.warn("Qualification name missing");
    return res.status(400).json({ status: 'error', message: "qualification name is required" });
  }
  try {
    const check = await prisma.qualification.findUnique({ where: { name } });
    if (check) {
      logger.warn(`Qualification already exists: ${name}`);
      return res.status(409).json({ status: 'error', message: "qualification already exists" });
    }
    const newCloud = await prisma.qualification.create({
      data: { name, isVerified: false },
    });
    return res.status(201).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    logger.error("addQualification Error:", JSON.stringify(error.message,null,2));
    return res.status(500).json({ status: 'error', message: `something went wrong ${error.message}` });
  }
};

export {
  getAllSkills,
  updateSkills,
  getAllCertifications,
  updateCertifications,
  getAllLocations,
  updateLocation,
  getAllClouds,
  addCloud,
  getAllRole,
  addRole,
  getAllQualification,
  addQualification
}
