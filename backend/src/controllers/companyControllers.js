import prisma from "../config/prisma.js";
import { handleError } from "../utils/handleError.js";
import { logger } from "../utils/logger.js";

// 🔹 Get All Companies (Company Cards)
const getCompaniesList = async (req, res) => {
  try {
    logger.info("getCompaniesList API hit");

    const companies = await prisma.companyProfile.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        headquarters: true,
        tagline: true,
        clouds: true,
        certifications: true,
        partnerTier: true,
        partnerType: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      data: companies,
    });
  } catch (error) {
    logger.error("Error fetching companies list:", error.message);
    handleError(error, req, res);
  }
};

// 🔹 Get Company Details (Public Page)
// const getCompanyDetails = async (req, res) => {
//   try {
//     logger.info("getCompanyDetails API hit");

//     const { slug } = req.params;

//     if (!slug) {
//       return res.status(400).json({
//         status: "error",
//         message: "Slug is required",
//       });
//     }

//     const company = await prisma.companyProfile.findUnique({
//       where: { slug },
//       include: {
//         organization: {
//           select: {
//             id: true,
//             jobs: {
//               where: {
//                 status: "Open",
//                 isDeleted: false,
//               },
//               select: {
//                 id: true,
//                 role: true,
//                 location: true,
//                 employmentType: true,
//                 createdAt: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!company) {
//       return res.status(404).json({
//         status: "error",
//         message: "Company not found",
//       });
//     }

//     const orgId = company.organization.id;

//     // 🔹 Bench Candidates
//     const benchCandidatesRaw = await prisma.userProfile.findMany({
//       where: {
//         organizationId: orgId,
//         status: "active",
//       },
//       select: {
//         id: true,
//         name: true,
//         title: true,
//         currentLocation: true,
//         profilePicture: true,
//       },
//       take: 10,
//       orderBy: { createdAt: "desc" },
//     });

//     const benchCandidates = benchCandidatesRaw.map((c) => ({
//       id: c.id,
//       name: c.name,
//       role: c.title,
//       location: c.currentLocation,
//       profileUrl: c.profilePicture,
//     }));

//     // 🔹 Organization Members
//     const orgMembersRaw = await prisma.organizationMember.findMany({
//       where: { organizationId: orgId },
//       select: {
//         role: true,
//         permissions: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             profileUrl: true,
//           },
//         },
//       },
//     });

//     const orgMembers = orgMembersRaw.map((m) => ({
//       id: m.user.id,
//       name: m.user.name,
//       email: m.user.email,
//       role: m.role,
//       permissions: m.permissions,
//       profileUrl: m.user.profileUrl,
//     }));

//     return res.status(200).json({
//       status: "success",
//       data: {
//         ...company,
//         organization: {
//           jobs: company.organization.jobs,
//           benchCandidates,
//           orgMembers,
//         },
//       },
//     });
//   } catch (error) {
//     logger.error("Error fetching company details:", error.message);
//     handleError(error, req, res);
//   }
// };

const getCompanyDetails = async (req, res) => {
  try {
    logger.info("getCompanyDetails API hit");

    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        status: "error",
        message: "Slug is required",
      });
    }

    const company = await prisma.companyProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        tagline: true,
        description: true,
        website: true,
        industry: true,
        companySize: true,
        foundedYear: true,
        headquarters: true,
        locations: true,
        clouds: true,
        certifications: true,
        specialties: true,
        socialLinks: true,
        slug: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Company not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: company,
    });
  } catch (error) {
    logger.error("Error fetching company details:", error.message);
    handleError(error, req, res);
  }
};
export { getCompaniesList, getCompanyDetails };
