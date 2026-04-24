import prisma from "../../config/prisma.js";
import multer from "multer";
import xlsx from "xlsx";

// ✅ CREATE COMPANY (Org + CompanyProfile)
export const createCompany = async (req, res) => {
  try {
    const { name, domain, profile } = req.body;

    /* 🔹 VALIDATION */
    if (!name || !domain) {
      return res.status(400).json({
        status: "error",
        message: "Name and domain are required",
      });
    }

    const normalizedDomain = domain.toLowerCase().trim();

    /* 🔹 CHECK DUPLICATE DOMAIN */
    const existingOrg = await prisma.organization.findUnique({
      where: { domain: normalizedDomain },
    });

    if (existingOrg) {
      return res.status(400).json({
        status: "error",
        message: "Organization with this domain already exists",
      });
    }

    /* 🔹 TRANSACTION */
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Organization
      const org = await tx.organization.create({
        data: {
          name: name.trim(),
          domain: normalizedDomain,
        },
      });

      // 2️⃣ Create Company Profile
      const company = await tx.companyProfile.create({
        data: {
          ...profile,
          organizationId: org.id,
        },
      });

      return { org, company };
    });

    return res.status(201).json({
      status: "success",
      message: "Company created successfully",
      data: result,
    });
  } catch (err) {
    console.error("❌ createCompany error:", err);

    return res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  }
};

// 🔹 Multer setup
const upload = multer({ storage: multer.memoryStorage() });
export const uploadCompaniesMiddleware = upload.single("file");

// 🔥 BULK JSON UPLOAD (WITHOUT INDUSTRY)
// export const uploadCompaniesFromJson = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         status: "error",
//         message: "No file uploaded",
//       });
//     }

//     const jsonData = JSON.parse(req.file.buffer.toString());

//     if (!Array.isArray(jsonData)) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid JSON format (must be array)",
//       });
//     }

//     let created = 0;
//     let skipped = 0;

//     for (const item of jsonData) {
//       try {
//         const domain = item.emailDomain?.toLowerCase()?.trim();

//         if (!domain) {
//           skipped++;
//           continue;
//         }

//         // 🔹 Check duplicate org
//         const existingOrg = await prisma.organization.findUnique({
//           where: { domain },
//         });

//         if (existingOrg) {
//           skipped++;
//           continue;
//         }

//         await prisma.$transaction(async (tx) => {
//           // 1️⃣ Create Organization
//           const org = await tx.organization.create({
//             data: {
//               name: item.name,
//               domain,
//             },
//           });

//           // 2️⃣ Create Company Profile (NO industry)
//           await tx.companyProfile.create({
//             data: {
//               name: item.name,
//               slug: item.slug,
//               tagline: item.tagline,
//               description: item.description,
//               website: item.website,
//               companySize: item.companySize,
//               foundedYear: item.foundedYear,
//               headquarters: item.headquarters,
//               locations: item.locations || [],
//               specialties: item.specialties || [],
//               clouds: item.clouds || [],
//               certifications: item.certifications || [],
//               partnerTier: item.partnerTier,
//               partnerType: item.partnerType,
//               organizationId: org.id,
//             },
//           });
//         });

//         created++;
//       } catch (err) {
//         console.error("❌ Error processing item:", err.message);
//         skipped++;
//       }
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "Bulk upload completed",
//       created,
//       skipped,
//       total: jsonData.length,
//       data: jsonData,
//     });
//   } catch (err) {
//     console.error("❌ bulk upload error:", err);

//     return res.status(500).json({
//       status: "error",
//       message: err.message || "Internal server error",
//     });
//   }
// };

const getValue = (obj, possibleKeys) => {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return null;
};

const normalizeRow = (item) => {
  const splitToArray = (val) =>
    typeof val === "string"
      ? val
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : Array.isArray(val)
        ? val
        : [];

  return {
    name: getValue(item, ["name", "Name"]),
    slug: getValue(item, ["slug", "Slug"]),
    tagline: getValue(item, ["tagline", "Tagline"]),
    description: getValue(item, ["description", "Description"]),
    website: getValue(item, ["website", "Website"]),

    emailDomain: String(
      getValue(item, ["emailDomain", "Email Domain", "Domain"]) || "",
    )
      .toLowerCase()
      .trim(),

    industry: getValue(item, ["industry", "Industry"]),
    companySize: getValue(item, ["companySize", "Company Size"]),
    foundedYear:
      Number(getValue(item, ["foundedYear", "Founded Year"])) || null,

    headquarters: getValue(item, ["headquarters", "Headquarters"]),

    locations: splitToArray(getValue(item, ["locations", "Locations"])),
    clouds: splitToArray(getValue(item, ["clouds", "Clouds"])),
    certifications: splitToArray(
      getValue(item, ["certifications", "Certifications"]),
    ),
    specialties: splitToArray(getValue(item, ["specialties", "Specialties"])),

    partnerTier: getValue(item, ["partnerTier", "Partner Tier"]),
    partnerType: getValue(item, ["partnerType", "Partner Type"]),

    appExchangeUrl: getValue(item, ["appExchangeUrl", "AppExchange URL"]),
  };
};
// 🔥 BULK JSON + EXCEL UPLOAD
export const uploadCompaniesFromJson = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    let jsonData = [];

    const fileName = req.file.originalname.toLowerCase();

    // ✅ HANDLE JSON
    if (fileName.endsWith(".json")) {
      jsonData = JSON.parse(req.file.buffer.toString());
    }

    // ✅ HANDLE EXCEL
    else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      jsonData = xlsx.utils.sheet_to_json(sheet);
    }

    // ❌ INVALID FILE
    else {
      return res.status(400).json({
        status: "error",
        message: "Only JSON or Excel files are allowed",
      });
    }
    jsonData = jsonData.map(normalizeRow);

    // 🔹 VALIDATE ARRAY
    if (!Array.isArray(jsonData)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid format (must be array)",
      });
    }

    let created = 0;
    let skipped = 0;

    for (const item of jsonData) {
      try {
        const domain = item.emailDomain?.toLowerCase()?.trim();

        if (!domain) {
          skipped++;
          continue;
        }

        const existingOrg = await prisma.organization.findUnique({
          where: { domain },
        });

        if (existingOrg) {
          skipped++;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const org = await tx.organization.create({
            data: {
              name: item.name,
              domain,
            },
          });

          await tx.companyProfile.create({
            data: {
              name: item.name,
              slug: item.slug,
              tagline: item.tagline,
              description: item.description,
              website: item.website,
              companySize: item.companySize,
              foundedYear: item.foundedYear,
              headquarters: item.headquarters,
              locations: item.locations || [],
              specialties: item.specialties || [],
              clouds: item.clouds || [],
              certifications: item.certifications || [],
              partnerTier: item.partnerTier,
              partnerType: item.partnerType,
              organizationId: org.id,
            },
          });
        });

        created++;
      } catch (err) {
        console.error("❌ Row error:", err.message);
        skipped++;
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Upload completed",
      created,
      skipped,
      total: jsonData.length,
      data: jsonData, // 🔥 FULL uploaded data
    });
  } catch (err) {
    console.error("❌ upload error:", err);

    return res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  }
};
