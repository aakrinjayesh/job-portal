import prisma from "../../config/prisma.js";
import sendEmail from "../../utils/sendEmail.js";
import axios from "axios";
import bcrypt from "bcrypt";
import {
  getAdminCreatedAccountEmailTemplate,
} from "../../utils/emailTemplates/LoginTemplates.js";

const external_backend_url = process.env.EXTERNAL_BACKEND_URL;

const adminCreateUser = async (req, res) => {
  console.log("admin user create");
  const { email: em, password, role, name } = req.body;

  const email = em?.toLowerCase().trim();

  if (!email || !password || !role || !name) {
    return res.status(400).json({
      status: "error",
      message: "Email, password, role, and name are required",
    });
  }

  try {
    /* 1️⃣ CHECK USER EXISTS */
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    /* 2️⃣ HASH PASSWORD */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 3️⃣ EXTERNAL CHAT */
    let externalUserId = null;

    try {
      if (external_backend_url) {
        const payload = {
          email,
          username: email.split("@")[0].toLowerCase(),
          password,
        };

        const response = await axios.post(
          `${external_backend_url}/api/v1/users/register`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 3000,
          },
        );

        externalUserId = response?.data?.data?.user?._id || null;

        if (externalUserId) {
          console.log("✅ External chat registration successful");
        }
      }
    } catch (err) {
      console.warn(
        "⚠️ External chat registration failed — continuing:",
        err.message,
      );
    }

    /* 4️⃣ MAIN TRANSACTION */
    const result = await prisma.$transaction(
      async (tx) => {
        /* CREATE USER */
        const newUser = await tx.users.create({
          data: {
            name,
            email,
            role,
            password: hashedPassword,
            emailverified: true,
            ...(externalUserId && { chatuserid: externalUserId }),
          },
        });

        /* 🔴 IMPORTANT: CHECK EXISTING MEMBERSHIP (YOU MISSED EARLIER) */
        const existingMembership = await tx.organizationMember.findFirst({
          where: { userId: newUser.id },
        });

        /* 🔹 COMPANY FLOW */
        if (!existingMembership && role === "company") {
          const domain = email.split("@")[1].toLowerCase();

          const domainMember = await tx.organizationMember.findFirst({
            where: {
              user: {
                role: "company",
                email: {
                  endsWith: `@${domain}`,
                  mode: "insensitive",
                },
              },
            },
            include: { user: true },
          });

          if (domainMember) {
            /* JOIN EXISTING ORG */
            const newMember = await tx.organizationMember.create({
              data: {
                userId: newUser.id,
                organizationId: domainMember.organizationId,
              },
            });

            await tx.users.update({
              where: { id: newUser.id },
              data: {
                companyName: domainMember.user?.companyName || null,
              },
            });

            const orgSubscription = await tx.organizationSubscription.findFirst(
              {
                where: { organizationId: domainMember.organizationId },
              },
            );

            if (orgSubscription) {
              const basicPlan = await tx.subscriptionPlan.findFirst({
                where: { tier: "BASIC" },
              });

              if (basicPlan) {
                const seat = await tx.licenseSeat.create({
                  data: {
                    subscriptionId: orgSubscription.id,
                    assignedToId: newMember.id,
                  },
                });

                await tx.license.create({
                  data: {
                    subscriptionId: orgSubscription.id,
                    planId: basicPlan.id,
                    seatId: seat.id,
                    assignedToId: newMember.id,
                    validUntil: new Date(
                      new Date().setMonth(new Date().getMonth() + 1),
                    ),
                    isActive: true,
                  },
                });
              }
            }
          } else {
            /* CREATE NEW ORG */
            const org = await tx.organization.create({
              data: {
                name: `${email.split("@")[1].split(".")[0]}'s Organization`,
              },
            });

            const subscription = await tx.organizationSubscription.create({
              data: {
                organizationId: org.id,
                status: "ACTIVE",
                billingCycle: "MONTHLY",
                autoRenew: true,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(
                  new Date().setMonth(new Date().getMonth() + 1),
                ),
                nextBillingDate: new Date(
                  new Date().setMonth(new Date().getMonth() + 1),
                ),
              },
            });

            const member = await tx.organizationMember.create({
              data: {
                userId: newUser.id,
                organizationId: org.id,
              },
            });

            const basicPlan = await tx.subscriptionPlan.findFirst({
              where: { tier: "BASIC" },
            });

            if (!basicPlan) {
              throw new Error("Basic Plan is not defined in DB");
            }

            const seat = await tx.licenseSeat.create({
              data: {
                subscriptionId: subscription.id,
                assignedToId: member.id,
              },
            });

            await tx.license.create({
              data: {
                subscriptionId: subscription.id,
                planId: basicPlan.id,
                seatId: seat.id,
                assignedToId: member.id,
                validUntil: new Date(
                  new Date().setMonth(new Date().getMonth() + 1),
                ),
                isActive: true,
              },
            });
          }
        }

        return newUser;
      },
      { timeout: 15000 },
    );

    /* 5️⃣ SEND EMAIL (same as setPassword) */
    try {
         await sendEmail({
           to: email,
           subject: "Welcome to ForceHead",
           html: getAdminCreatedAccountEmailTemplate({
             name: result.name,
             role: result.role,
             username: email,                    // or email.split("@")[0] if you prefer just the handle
             password: password,  
           }),
         });
       } catch (err) {
         console.warn("Email failed:", err.message);
       }

    /* 6️⃣ RESPONSE */
    return res.status(201).json({
      status: "success",
      message: "User created successfully by admin",
      chatIntegrated: !!externalUserId,
    });
  } catch (error) {
    console.error("Admin create user error:", error.message);
    console.log("stack:", error.stack);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// 🔍 Lookup user by email — full details
const getUserByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email || !email.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Email is required",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        companyName: true,
        profileUrl: true,
        emailverified: true,
        isactive: true,
        notificationsEnabled: true,
        notificationType: true,
        createdAt: true,

        // Org membership
        organizationMember: {
          select: {
            id: true,
            role: true,
            permissions: true,
            organization: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                companyProfile: {
                  select: {
                    slug: true,
                    industry: true,
                    companySize: true,
                    website: true,
                    headquarters: true,
                    logoUrl: true,
                  },
                },
                subscription: {
                  select: {
                    id: true,
                    status: true,
                    billingCycle: true,
                    autoRenew: true,
                    currentPeriodStart: true,
                    currentPeriodEnd: true,
                    nextBillingDate: true,
                    licenses: {
                      where: { isActive: true },
                      select: {
                        id: true,
                        validFrom: true,
                        validUntil: true,
                        plan: {
                          select: {
                            tier: true,
                            name: true,
                            monthlyPrice: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // Candidate profile
        CandidateProfile: {
          select: {
            id: true,
            title: true,
            summary: true,
            currentLocation: true,
            preferredLocation: true,
            preferredJobType: true,
            totalExperience: true,
            certifications: true,
            isVerified: true,
            linkedInUrl: true,
            status: true,
            currentCTC: true,
            expectedCTC: true,
            createdAt: true,
          },
        },

        // Counts
        Job: { select: { id: true } },
        JobApplications: { select: { id: true } },
        savedCandidates: { select: { id: true } },
        aiTokenUsages: { select: { totalTokens: true } },

        // Recent sessions
        userSession: {
          where: { revoked: false },
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with that email",
      });
    }

    const totalAiTokens = user.aiTokenUsages.reduce(
      (sum, r) => sum + r.totalTokens,
      0
    );

    return res.status(200).json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        companyName: user.companyName,
        profileUrl: user.profileUrl,
        emailverified: user.emailverified,
        isactive: user.isactive,
        notificationsEnabled: user.notificationsEnabled,
        notificationType: user.notificationType,
        createdAt: user.createdAt,
        stats: {
          jobsPosted: user.Job.length,
          jobApplications: user.JobApplications.length,
          savedCandidates: user.savedCandidates.length,
          totalAiTokensUsed: totalAiTokens,
        },
        organizationMember: user.organizationMember ?? null,
        candidateProfile: user.CandidateProfile ?? null,
        activeSessions: user.userSession,
      },
    });
  } catch (error) {
    console.error("getUserByEmail error:", error.message);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ❌ Delete user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: "error", message: "User ID is required" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationMember: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                _count: { select: { members: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const warnings = [];

    // Warn if sole admin of org
    if (
      user.organizationMember?.role === "COMPANY_ADMIN" &&
      user.organizationMember.organization._count.members === 1
    ) {
      warnings.push(
        `User is the only admin of "${user.organizationMember.organization.name}". The organization will be left without an admin.`
      );
    }

    // Revoke all sessions first
    await prisma.userSession.updateMany({
      where: { userId: id },
      data: { revoked: true },
    });

    // Delete user (cascades per schema)
    await prisma.users.delete({ where: { id } });

    return res.status(200).json({
      status: "success",
      message: `User "${user.name}" (${user.email}) deleted successfully`,
      warnings,
    });
  } catch (error) {
    console.error("deleteUser error:", error.message);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export { adminCreateUser,getUserByEmail, deleteUser };
