// controllers/vendorControllers.js
import prisma from "../config/prisma.js";

// ✅ Get all candidates for a vendor
const getVendorCandidates = async (req, res) => {
  try {
    const userAuth = req.user;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can view candidates.",
      });
    }

    const candidates = await prisma.userProfile.findMany({
      where: { vendorId: userAuth.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      message: "Vendor candidates fetched successfully.",
      data: candidates,
    });
  } catch (err) {
    console.error("Error fetching vendor candidates:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error fetching vendor candidates.",
    });
  }
};

// ✅ Create a new candidate for vendor
const createVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can create candidates.",
      });
    }

    const data = req.body;

    const newCandidate = await prisma.userProfile.create({
      data: {
        vendorId: userAuth.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        title: data.title,
        portfolioLink: data.portfolioLink,
        preferredLocation: data.preferredLocation || [],
        currentLocation: data.currentLocation,
        preferredJobType: data.preferredJobType || [],
        currentCTC: data.currentCTC,
        expectedCTC: data.expectedCTC,
        rateCardPerHour: data.rateCardPerHour,
        joiningPeriod: data.joiningPeriod,
        totalExperience: data.totalExperience,
        relevantSalesforceExperience: data.relevantSalesforceExperience,
        skillsJson: data.skillsJson || [],
        primaryClouds: data.primaryClouds || [],
        secondaryClouds: data.secondaryClouds || [],
        certifications: data.certifications || [],
        workExperience: data.workExperience || [],
        education: data.education || [],
        linkedInUrl: data.linkedInUrl,
        trailheadUrl: data.trailheadUrl,
        profilePicture: data.profilePicture,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Candidate created successfully.",
      data: newCandidate,
    });
  } catch (err) {
    console.error("Error creating vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error creating vendor candidate.",
    });
  }
};

// ✅ Update vendor candidate
// const updateVendorCandidate = async (req, res) => {
//   try {
//     const userAuth = req.user;
//     const { id, ...data } = req.body;

//     if (userAuth.role !== "company") {
//       return res.status(403).json({
//         status: "failed",
//         message: "Access denied. Only vendors can update candidates.",
//       });
//     }

//     const existingCandidate = await prisma.userProfile.findFirst({
//       where: {
//         id,
//         vendorId: userAuth.id,
//       },
//     });

//     if (!existingCandidate) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Candidate not found or not authorized to update.",
//       });
//     }

//     const updatedCandidate = await prisma.userProfile.update({
//       where: { id },
//       data,
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Candidate updated successfully.",
//       data: updatedCandidate,
//     });
//   } catch (err) {
//     console.error("Error updating vendor candidate:", err);
//     return res.status(500).json({
//       status: "failed",
//       message: "Error updating vendor candidate.",
//     });
//   }
// };
const updateVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;
    const { id, ...data } = req.body;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can update candidates.",
      });
    }

    const existingCandidate = await prisma.userProfile.findFirst({
      where: {
        id,
        vendorId: userAuth.id,
      },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        status: "failed",
        message: "Candidate not found or not authorized to update.",
      });
    }

    // ⭐ Ignore undefined fields (very important)
    const safeData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const updatedCandidate = await prisma.userProfile.update({
      where: { id },
      data: safeData,
    });

    return res.status(200).json({
      status: "success",
      message: "Candidate updated successfully.",
      data: updatedCandidate,
    });
  } catch (err) {
    console.error("Error updating vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error updating vendor candidate.",
    });
  }
};


// ✅ Delete vendor candidate (hard delete)
const deleteVendorCandidate = async (req, res) => {
  try {
    const userAuth = req.user;
    const { id } = req.body;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Only vendors can delete candidates.",
      });
    }

    const existingCandidate = await prisma.userProfile.findFirst({
      where: {
        id,
        vendorId: userAuth.id,
      },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        status: "failed",
        message: "Candidate not found or not authorized to delete.",
      });
    }

    await prisma.userProfile.delete({ where: { id } });

    return res.status(200).json({
      status: "success",
      message: "Candidate deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting vendor candidate:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error deleting vendor candidate.",
    });
  }
};




 const updateCandidateStatus = async (req, res) => {
  try {
    const { candidateIds, status } = req.body;

    if (!candidateIds?.length || !status) {
      return res.status(400).json({
        status: "failed",
        message: "candidateIds and status are required",
      });
    }

    // ⚡ Update all selected candidates
    await prisma.userProfile.updateMany({
      where: { id: { in: candidateIds } },
      data: { status: status   }, // Boolean -> true/false
    });

    return res.status(200).json({
      status: "success",
      message: "Candidate status updated successfully",
    });

  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};




const getAllVendorCandidates = async (req, res) => {
  try {
    const userAuth = req.user;

    if (userAuth.role !== "company") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied.",
      });
    }

    // --- PAGINATION ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // --- FETCH CANDIDATES FOR THIS VENDOR ---
//     const [candidates, totalCount] = await Promise.all([
      

//       prisma.userProfile.findMany({
//   skip,
//   take: limit,
//   orderBy: { createdAt: "desc" },
//   include: {
//     vendor: {     // <--- this enables vendor.email
//       select: {
//         id: true,
//         name: true,
//         email: true
//       }
//     }
//   }
// }),


//       prisma.userProfile.count({
//         where: {
//           vendorId: {
//             not: null,
//           }
//         }
//       })
//     ]);

const [candidates, totalCount] = await Promise.all([
  prisma.userProfile.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }),

  prisma.userProfile.count()   // ✅ REMOVE vendorId filter
]);


    // --- REMOVE DUPLICATES ---
    const unique = {};
    candidates.forEach((c) => (unique[c.id] = c));
    const finalCandidates = Object.values(unique);

    return res.status(200).json({
      status: "Success",
      candidates: finalCandidates,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });

  } catch (error) {
    console.error("getAllVendorCandidates Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch vendor candidates",
    });
  }
};







export {
  getVendorCandidates,
  createVendorCandidate,
  updateVendorCandidate,
  deleteVendorCandidate,
   updateCandidateStatus,
   getAllVendorCandidates
};
