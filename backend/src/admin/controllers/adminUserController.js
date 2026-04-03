import prisma from "../../config/prisma.js";
import sendEmail from "../../utils/sendEmail.js";
import axios from "axios";
import bcrypt from "bcrypt";

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
      // await sendEmail({
      //   to: email,
      //   subject: "Welcome to ForceHead",
      //   html: getWelcomePasswordEmailTemplate({
      //     name: result.name,
      //     role: result.role,
      //   }),
      // });
      console.log("mail sent");
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

export { adminCreateUser };
