import prisma from "../config/prisma.js";
import extractTextFromBase64 from "../utils/extractText.js";
import { handleError } from "../utils/handleError.js";
// import { extractResumeSections } from '../utils/llmTextExtractor.js'
import { extractAIText } from "../utils/ai/extractAI.js";
import { extractTextWithOCR } from "../utils/ai/ocr.js";
import { chunkText } from "../utils/ai/chunk.js";
import { mergeResumeChunks } from "../utils/ai/merge.js";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import mammoth from "mammoth";
import { uploadToCloudinary } from "../utils/Storage.js";
import { generateSlug } from "../utils/slugify.js";

// for uploading pdf and extracting all the details from it for both vendor and candidate

const UploadResume = async (req, res) => {
  try {
    logger.info("UploadResume API hit");

    if (!req.file) {
      logger.warn("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { role } = req.body;
    const { buffer, mimetype, originalname, size } = req.file;

    // 🔥 Upload resume to S3
    const uploadedFile = await uploadToCloudinary(req.file);

    if (!uploadedFile || !uploadedFile.url) {
      return res.status(500).json({
        status: "error",
        message: "Resume upload failed",
      });
    }

    const originalFileUrl = uploadedFile.url;

    logger.info(
      `File received: ${originalname}, Type: ${mimetype}, Role: ${role}`,
    );

    let extractedText = "";

    // ✅ PDF handling
    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromBase64(buffer);
      logger.info(`PDF text extracted. Characters: ${extractedText.length}`);

      // Fallback to OCR if PDF yields no/too little text (scanned PDF)
      if (!extractedText || extractedText.trim().length < 50) {
        logger.warn("PDF text too short — falling back to OCR");
        try {
          extractedText = await extractTextWithOCR(buffer);
          logger.info(`OCR extracted ${extractedText.length} characters`);
        } catch (ocrErr) {
          logger.error("OCR fallback failed:", ocrErr.message);
          extractedText = "";
        }
      }
    }

    // ✅ DOCX handling
    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      logger.info("Extracted text from DOCX");
    }

    // ❌ Unsupported file
    else {
      logger.warn("Unsupported file type:", mimetype);
      return res.status(400).json({
        error: "Unsupported file type. Please upload PDF or DOCX only.",
      });
    }

    // Clean whitespace
    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText || extractedText.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Unable to extract text from the uploaded file",
      });
    }

    // Chunk → process each chunk → merge
    const chunks = chunkText(extractedText, 3000);
    logger.info(`Resume split into ${chunks.length} chunk(s)`);

    const parsedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      logger.info(`Processing chunk ${i + 1}/${chunks.length}`);
      const result = await extractAIText(chunks[i], role);
      if (result?.data) {
        parsedChunks.push(result.data);
      } else {
        logger.warn(`Chunk ${i + 1} returned null — skipping`);
      }
    }

    if (parsedChunks.length === 0) {
      return res.status(422).json({
        status: "error",
        message: "AI failed to parse the resume. Please try again.",
      });
    }

    const merged = mergeResumeChunks(parsedChunks);

    return res.status(200).json({
      message: "File received successfully",
      fileName: originalname,
      mimeType: mimetype,
      size,
      originalFileUrl,
      extracted: merged,
    });
  } catch (err) {
    logger.error("Error in UploadResume:", err);
    handleError(err, req, res);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while uploading",
      metadata: err.message,
    });
  }
};

// add or update profile details for both vendor and candidate
const updateProfiledetails = async (req, res) => {
  try {
    logger.info("updateProfiledetails API hit");

    if (!req.body) {
      logger.warn("No body found in request");
      return res.status(400).json({ message: "No body found" });
    }

    const userFromToken = req.user;
    logger.info(`Update for user: ${userFromToken?.email}`);

    const user = await prisma.users.findUnique({
      where: { email: userFromToken.email },
    });

    if (!user) {
      logger.warn("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    const {
      profilePicture,
      name = null,
      phoneNumber = null,
      portfolioLink = null,
      originalFileUrl,
      email = null,
      preferredLocation = [],
      preferredJobType = [],
      currentLocation = null,
      currentCTC = null,
      expectedCTC = null,
      rateCardPerHour = {},
      joiningPeriod = null,
      totalExperience = null,
      relevantSalesforceExperience = null,
      skillsJson = [],
      primaryClouds = [],
      secondaryClouds = [],
      certifications = [],
      workExperience = [],
      education = [],
      linkedInUrl = null,
      trailheadUrl = null,
      title,
      summary = null,
      status,
    } = req.body;

    const upserted = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        profilePicture,
        originalFileUrl, // ✅ ADD

        name,
        phoneNumber,
        portfolioLink,
        email,
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
        rateCardPerHour,
        joiningPeriod,
        totalExperience,
        relevantSalesforceExperience,
        skillsJson,
        primaryClouds,
        secondaryClouds,
        certifications,
        workExperience,
        linkedInUrl,
        trailheadUrl,
        education,
        currentLocation,
        title,
        summary,
        ...(user.role === "candidate" ? { status: status ?? "active" } : {}),
      },
      create: {
        userId: user.id,
        profilePicture,
        originalFileUrl,
        name,
        phoneNumber,
        portfolioLink,
        email,
        preferredLocation,
        preferredJobType,
        currentCTC,
        expectedCTC,
        rateCardPerHour,
        joiningPeriod,
        totalExperience,
        relevantSalesforceExperience,
        skillsJson,
        primaryClouds,
        secondaryClouds,
        certifications,
        workExperience,
        education,
        currentLocation,
        linkedInUrl,
        trailheadUrl,
        title,
        summary,
        chatuserid: user.chatuserid,
        ...(user.role === "candidate" ? { status: status ?? "active" } : {}),
      },
    });

    logger.info("Profile updated successfully", { userId: upserted.userId });

    return res.status(200).json({ status: "success", data: upserted.userId });
  } catch (err) {
    console.error("Error saving user profile:", err.message);
    handleError(err, req, res);
    return res.status(500).json({
      status: "failed",
      message: "Could not save profile" + err.message,
    });
  }
};

const getUserProfileDetails = async (req, res) => {
  try {
    logger.info("getUserProfileDetails API hit");

    const { id } = req.user;

    if (!id) {
      logger.warn("User ID missing in token");
      return res.status(400).json({ message: "User ID missing in token" });
    }

    logger.info(`Fetching profile for User ID: ${id}`);

    const user = await prisma.userProfile.findUnique({
      where: { userId: id },
    });

    if (!user) {
      logger.warn("User profile not found");
      return res
        .status(200)
        .json({ status: "failed", message: "User not found" });
    }

    logger.info("User profile fetched successfully");

    return res.status(200).json({ status: "success", user });
  } catch (error) {
    logger.error(
      "Error fetching profile:",
      JSON.stringify(error.message, null, 2),
    );
    handleError(error, req, res);
    return res
      .status(200)
      .json({ status: "error", message: "Internal server error" });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    console.log("uploadProfilePicture API hit");

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    // 🔥 Upload file object (not just buffer)
    const uploadedFile = await uploadToCloudinary(req.file);
    // const uploadedFile = await uploadToCloudinary(req.file.buffer);
    // const uploadedFile = await uploadToCloudinary(req.file.path);

    if (!uploadedFile) {
      return res.status(500).json({
        status: "error",
        message: "S3 upload failed",
      });
    }

    return res.status(200).json({
      url: uploadedFile.url, // public S3 URL
    });
  } catch (error) {
    console.error("Profile Picture Upload Error:", error);

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Upload failed",
    });
  }
};

// company controllers

const getCompanyProfileDetails = async (req, res) => {
  try {
    logger.info("getCompanyProfileDetails API hit");

    const { id } = req.user;

    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        organizationMember: {
          include: {
            organization: {
              include: {
                companyProfile: true,
                address: true, // ← org-level address
              },
            },
          },
        },
      },
    });

    if (!user) {
      logger.warn("User profile not found");
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const org = user.organizationMember?.organization;
    const companyProfile = org?.companyProfile || null;
    const address = org?.address || null; // ← org address, shared by all members

    const [firstName = "", lastName = ""] = user.name?.split(" ") || [];

    const data = {
      // USER DETAILS
      name: user.name,
      email: user.email || null,
      firstName,
      lastName,
      phoneNumber: user.phoneNumber,
      companyName: user.companyName,
      profileUrl: user.profileUrl,

      // ORG-LEVEL ADDRESS (shared across all org members)
      address,

      // COMPANY PROFILE DETAILS
      companyProfile: {
        tagline: companyProfile?.tagline || null,
        description: companyProfile?.description || null,
        website: companyProfile?.website || null,
        // industry: companyProfile?.industry || null,
        companySize: companyProfile?.companySize || null,
        foundedYear: companyProfile?.foundedYear || null,
        headquarters: companyProfile?.headquarters || null,
        locations: companyProfile?.locations || [],
        specialties: companyProfile?.specialties || [],
        logoUrl: companyProfile?.logoUrl || null,
        coverImage: companyProfile?.coverImage || null,
        clouds: companyProfile?.clouds || [],
        certifications: companyProfile?.certifications || [],
        partnerTier: companyProfile?.partnerTier || null, // ✅ ADD
        partnerType: companyProfile?.partnerType || null,
        socialLinks: companyProfile?.socialLinks || null,
        slug: companyProfile?.slug || null,
      },
    };

    return res.status(200).json({ status: "success", data });
  } catch (error) {
    logger.error(
      "Error fetching profile:",
      JSON.stringify(error.message, null, 2),
    );
    handleError(error, req, res);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getPublicCompanyProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const company = await prisma.companyProfile.findUnique({
      where: { slug },
      include: {
        organization: {
          select: {
            id: true,
            jobs: {
              where: {
                status: "Open",
                isDeleted: false,
              },
              select: {
                id: true,
                role: true,
                location: true,
                employmentType: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Company not found",
      });
    }

    const orgId = company.organization.id;

    // ─────────────────────────────
    // 👤 BENCH CANDIDATES
    // ─────────────────────────────
    const benchCandidatesRaw = await prisma.userProfile.findMany({
      where: {
        organizationId: orgId,
        status: "active",
      },
      select: {
        id: true,
        name: true,
        title: true,
        currentLocation: true,
        profilePicture: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const benchCandidates = benchCandidatesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.title,
      location: c.currentLocation,
      profileUrl: c.profilePicture,
    }));

    // ─────────────────────────────
    // 👥 ORGANIZATION MEMBERS
    // ─────────────────────────────
    const orgMembersRaw = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            profileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const orgMembers = orgMembersRaw.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      permissions: m.permissions,
      profileUrl: m.user.profileUrl,
    }));

    // ─────────────────────────────
    // RESPONSE
    // ─────────────────────────────
    return res.json({
      status: "success",
      data: {
        ...company,
        organization: {
          jobs: company.organization.jobs,
          benchCandidates,
          orgMembers,
        },
      },
    });
  } catch (error) {
    console.error("Public company fetch error:", error);

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    logger.info("updateCompanyProfile API hit");

    const { id } = req.user;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Payload is missing" });
    }

    const user = await prisma.users.findUnique({
      where: { id },
      include: { organizationMember: true },
    });

    if (!user) {
      logger.warn("User not found");
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const organizationId = user.organizationMember?.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        status: "error",
        message: "User does not belong to an organization",
      });
    }

    const {
      companyName,
      address,
      tagline,
      description,
      website,
      // industry,
      companySize,
      foundedYear,
      headquarters,
      locations,
      specialties,
      logoUrl,
      coverImage,
      socialLinks,
      clouds, // ✅ ADD THIS
      certifications,
      partnerTier,
      partnerType,
    } = payload;

    const baseSlug = companyName
      ? await generateSlug(companyName, prisma)
      : null;

    await prisma.$transaction(async (tx) => {
      // — sync companyName back onto the users row —
      if (companyName) {
        await tx.users.update({
          where: { id },
          data: { companyName },
        });
      }

      // — address upsert keyed on organizationId (shared for all org members) —
      if (address) {
        await tx.address.upsert({
          where: { organizationId }, // ← org-scoped, not userId
          update: {
            doorNumber: address.doorNumber,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            pinCode: address.pinCode,
          },
          create: {
            organizationId, // ← org-scoped, not userId
            doorNumber: address.doorNumber,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            pinCode: address.pinCode,
          },
        });
      }

      // — company profile upsert —
      // const companyData = {
      //   name: companyName,
      //   tagline,
      //   description,
      //   website,
      //   // industry,
      //   industry: industry || "Not Specified",
      //   companySize,
      //   foundedYear,
      //   headquarters,
      //   locations,
      //   specialties,
      //   logoUrl,
      //   coverImage,
      //   socialLinks,
      //   clouds, // ✅ ADD THIS
      //   certifications,
      //   partnerTier,
      //   partnerType,
      // };
      const companyData = {
        name: companyName || "Company",
        tagline,
        description,
        website: website || "https://example.com",

        // ✅ FIX (very important)
        // industry: industry || "Not Specified",
        companySize: companySize || "1-10",
        foundedYear: foundedYear || 2024,
        headquarters: headquarters || "Unknown",

        locations: locations?.length ? locations : ["India"],
        specialties: specialties || [],

        logoUrl,
        coverImage,
        socialLinks: socialLinks || {},

        clouds: clouds || [],
        certifications: certifications || [],

        partnerTier,
        partnerType,
      };

      await tx.companyProfile.upsert({
        where: { organizationId },
        update: companyData,
        create: {
          organizationId,
          name: companyName || user.companyName || "Company",
          slug: baseSlug,
          ...companyData,
        },
      });
    });

    return res.status(200).json({
      status: "success",
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating company profile:", error.message);
    handleError(error, req, res);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const updateCompanyPersonalProfile = async (req, res) => {
  try {
    logger.info("updatePersonalProfile API hit");

    const { id } = req.user;
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Payload is missing",
      });
    }

    const user = await prisma.users.findUnique({ where: { id } });

    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const { name, phoneNumber, profileUrl } = payload;

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        profileUrl,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Personal profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating personal profile:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get Countries + States (Address form)
const getCountriesWithStates = async (req, res) => {
  console.log("in get countries");
  try {
    const countries = await prisma.country.findMany({
      include: { states: true },
    });
    console.log(JSON.stringify(countries, null, 2));
    return res.json({
      status: "success",
      data: countries,
    });
  } catch (error) {
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Unable to fetch countries",
    });
  }
};
const toggleCandidateStatus = async (req, res) => {
  try {
    logger.info("toggleCandidateStatus API hit");

    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ message: "User ID missing in token" });
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: id },
    });

    if (!existingProfile) {
      return res.status(404).json({
        status: "error",
        message: "User profile not found",
      });
    }

    const newStatus =
      existingProfile.status === "active" ? "inactive" : "active";

    const updated = await prisma.userProfile.update({
      where: { userId: id },
      data: { status: newStatus },
    });

    logger.info(`Status toggled to ${newStatus} for userId: ${id}`);

    return res.status(200).json({
      status: "success",
      newStatus: updated.status,
      message: `Profile is now ${newStatus}`,
    });
  } catch (error) {
    logger.error("Error toggling candidate status:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateCandidateStatusProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { hiddenDomains = [] } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID missing",
      });
    }

    const domains = hiddenDomains.map((d) => d.toLowerCase().trim());

    const profile = await prisma.userProfile.update({
      where: {
        userId: userId,
      },
      data: {
        hiddenDomains: domains,
      },
    });

    return res.status(200).json({
      status: "success",
      profile,
    });
  } catch (error) {
    console.error("updateCandidateProfile Error:", error);

    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { notificationsEnabled: true, notificationType: true },
    });
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    handleError(error, req, res);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationsEnabled, notificationType } = req.body;

    const validTypes = ["DAILY", "WEEKLY"];
    if (
      notificationType !== undefined &&
      !validTypes.includes(notificationType)
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid notificationType" });
    }

    const data = {};
    if (notificationsEnabled !== undefined)
      data.notificationsEnabled = notificationsEnabled;
    if (notificationType !== undefined)
      data.notificationType = notificationType;

    const user = await prisma.users.update({
      where: { id: userId },
      data,
      select: { notificationsEnabled: true, notificationType: true },
    });

    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    handleError(error, req, res);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export {
  UploadResume,
  updateProfiledetails,
  updateCompanyPersonalProfile,
  updateCompanyProfile,
  getUserProfileDetails,
  getCountriesWithStates,
  uploadProfilePicture,
  getPublicCompanyProfile,
  getCompanyProfileDetails,
  toggleCandidateStatus,
  updateCandidateStatusProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
};
