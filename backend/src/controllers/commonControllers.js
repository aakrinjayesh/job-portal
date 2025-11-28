import prisma from '../config/prisma.js'




// Fetch all Skills
const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skills.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({ status: 'success', data: skills });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

const updateSkills = async (req, res) => {
  const { name } = req.body;
  if(!name){
    return res.status(200).json({ status:'failed', message: "Skill name is required" });
  }
  try {
    const check = await prisma.skills.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Skill already exists" });
    }
    const newSkill = await prisma.skills.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    res.status(200).json({success:'failed', message: "Skill already exists or something went wrong" });
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
    res.status(500).json({ status: 'failed', message: err.message });
  }
};

const updateCertifications = async (req, res) => {
  const { name } = req.body;
  if(!name){
   return res.status(200).json({ status:'failed', message: "Certification name is required" });
  }
  try {
    const check = await prisma.certification.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Certification already exists" });
    }
    const newSkill = await prisma.certification.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    return res.status(200).json({status: 'failed', message: "Certification already exists or something went wrong" });
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
    res.status(500).json({ status: 'failed', message: err.message });
  }
};


const updateLocation = async (req, res) => {
  const { name } = req.body;
  if(!name){
    return res.status(200).json({ status:'failed', message: "Location name is required" });
  }
  try {
    const check = await prisma.location.findUnique({ where: { name } });
    if(check){
      return res.status(200).json({ status:'failed', message: "Location already exists" });
    }
    const newSkill = await prisma.location.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({status:'success', id: newSkill.id });
  } catch (error) {
    return res.status(200).json({status:'failed', message: "Location already exists or something went wrong" });
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
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

// Add a cloud
const addCloud = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(200).json({ status: 'failed', message: "Cloud name is required" });
  }
  try {
    const check = await prisma.cloud.findUnique({ where: { name } });
    if (check) {
      return res.status(200).json({ status: 'failed', message: "Cloud already exists" });
    }
    const newCloud = await prisma.cloud.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    return res.status(200).json({ status: 'failed', message: "Cloud already exists or something went wrong" });
  }
};


const getAllRole = async (req, res) => {
  try {
    const clouds = await prisma.companyRole.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ status: 'success', data: clouds });
  } catch (err) {
    return res.status(500).json({ status: 'failed', message: err.message });
  }
};

// Add a cloud
const addRole = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(200).json({ status: 'failed', message: "Cloud name is required" });
  }
  try {
    const check = await prisma.companyRole.findUnique({ where: { name } });
    if (check) {
      return res.status(200).json({ status: 'failed', message: "Cloud already exists" });
    }
    const newCloud = await prisma.cloud.create({
      data: { name, isVerified: false },
    });
    return res.status(200).json({ status: 'success', id: newCloud.id });
  } catch (error) {
    return res.status(200).json({ status: 'failed', message: "Cloud already exists or something went wrong" });
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
  addRole
}
