// controllers/billing/createInvoice.ts
import prisma from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/handleError.js";

const createInvoice = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { planTier, quantity, billingCycle, country } = req.body;
    const rawBillingCycle = billingCycle?.toUpperCase();

    if (!["MONTHLY", "YEARLY"].includes(rawBillingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle" });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: planTier },
    });

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const address = await prisma.address.findUnique({
      where: { organizationId },
    });

    const detectedCountry = address?.country || country || "IN";

    const unitPrice =
      rawBillingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;

    const subtotal = unitPrice * quantity;
    const tax = detectedCountry === "IN" ? Math.round(subtotal * 0.18) : 0;
    const total = subtotal + tax;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "Subscription not found" });
    }

    const now = new Date();
    const periodEnd =
      rawBillingCycle === "MONTHLY"
        ? new Date(new Date().setMonth(now.getMonth() + 1))
        : new Date(new Date().setFullYear(now.getFullYear() + 1));

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: `INV-${Date.now()}`,
        status: "PENDING",
        billingCycle: rawBillingCycle,
        planTier,
        subtotal,
        tax,
        total,
        quantity,
        periodStart: now,
        periodEnd,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });

    res.status(200).json({
      status: "success",
      invoiceId: invoice.id,
      total,
    });
  } catch (error) {
    console.log("error create invoice", error.message);
    handleError(error, req, res);
    res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.status !== "PENDING") {
      return res.status(400).json({ error: "Invalid invoice" });
    }

    const order = await razorpay.orders.create({
      amount: invoice.total * 100,
      currency: "INR",
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscriptionId,
      },
    });

    res.status(200).json({
      status: "success",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("error razorpay order", error.message);
    handleError(error, req, res);
    res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId,
    } = req.body;

    // 🔐 Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // 🔎 Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.status(200).json({
        status: "success",
        message: "Already processed",
      });
    }

    // 🔎 Fetch plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: invoice.planTier },
      include: { limits: true },
    });

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const now = new Date();
    const periodEnd = invoice.periodEnd;

    const { payingMemberEmail, payingMemberName } = await prisma.$transaction(
      async (tx) => {
        // 1️⃣ Mark invoice paid
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID", paidAt: now },
        });

        // 2️⃣ Record payment
        await tx.payment.create({
          data: {
            subscriptionId: invoice.subscriptionId,
            invoiceId: invoice.id,
            amount: invoice.total,
            currency: "INR",
            status: "COMPLETED",
            gateway: "RAZORPAY",
            gatewayPaymentId: razorpay_payment_id,
            gatewaySessionId: razorpay_order_id,
          },
        });

        // 3️⃣ Subscription
        const subscription = await tx.organizationSubscription.findUnique({
          where: { id: invoice.subscriptionId },
        });

        if (!subscription) {
          throw new Error("Subscription not found");
        }

        // 4️⃣ Buyer member
        const buyerMember = await tx.organizationMember.findFirst({
          where: {
            userId: req.user.id,
            organizationId: subscription.organizationId,
          },
        });

        if (!buyerMember) {
          throw new Error("Buyer not part of organization");
        }

        // 5️⃣ Find buyer's current seat → active license
        const buyerSeat = await tx.licenseSeat.findFirst({
          where: { assignedToId: buyerMember.id },
          include: {
            licenses: {
              where: { isActive: true },
              include: { plan: true },
            },
          },
        });

        const existingLicense = buyerSeat?.licenses[0];

        if (!existingLicense) {
          throw new Error("License invariant broken (BASIC missing)");
        }

        // 🔹 Plan hierarchy
        const PLAN_ORDER = {
          BASIC: 1,
          PROFESSIONAL: 2,
          ORGANISATION: 3,
        };

        const currentTier = existingLicense.plan.tier;
        const newTier = plan.tier;

        const isUpgrade = PLAN_ORDER[newTier] > PLAN_ORDER[currentTier];

        const isSamePlan = PLAN_ORDER[newTier] === PLAN_ORDER[currentTier];

        const isDowngrade = PLAN_ORDER[newTier] < PLAN_ORDER[currentTier];

        // ==================================================
        // 🟢 CASE 1: UPGRADE — deactivate old, create new on same seat
        // ==================================================
        if (isUpgrade) {
          await tx.license.update({
            where: { id: existingLicense.id },
            data: { isActive: false },
          });

          await tx.license.create({
            data: {
              subscriptionId: invoice.subscriptionId,
              planId: plan.id,
              seatId: buyerSeat.id,
              assignedToId: buyerMember.id,
              validFrom: now,
              validUntil: periodEnd,
              isActive: true,
            },
          });

          // Create additional seats + licenses for remaining quantity
          const remaining = invoice.quantity - 1;
          for (let i = 0; i < remaining; i++) {
            const newSeat = await tx.licenseSeat.create({
              data: { subscriptionId: invoice.subscriptionId },
            });
            await tx.license.create({
              data: {
                subscriptionId: invoice.subscriptionId,
                planId: plan.id,
                seatId: newSeat.id,
                validFrom: now,
                validUntil: periodEnd,
                isActive: true,
              },
            });
          }
        }

        // ==================================================
        // 🟢 CASE 2: SAME PLAN — create new seats + licenses
        // ==================================================
        else if (isSamePlan) {
          for (let i = 0; i < invoice.quantity; i++) {
            const newSeat = await tx.licenseSeat.create({
              data: { subscriptionId: invoice.subscriptionId },
            });
            await tx.license.create({
              data: {
                subscriptionId: invoice.subscriptionId,
                planId: plan.id,
                seatId: newSeat.id,
                validFrom: now,
                validUntil: periodEnd,
                isActive: true,
              },
            });
          }
        }

        // ==================================================
        // 🔴 CASE 3: DOWNGRADE — create new seats + licenses
        // ==================================================
        else if (isDowngrade) {
          for (let i = 0; i < invoice.quantity; i++) {
            const newSeat = await tx.licenseSeat.create({
              data: { subscriptionId: invoice.subscriptionId },
            });
            await tx.license.create({
              data: {
                subscriptionId: invoice.subscriptionId,
                planId: plan.id,
                seatId: newSeat.id,
                validFrom: now,
                validUntil: periodEnd,
                isActive: true,
              },
            });
          }
        }

        // 6️⃣ Admin assignment
        const existingAdmin = await tx.organizationMember.findFirst({
          where: {
            organizationId: subscription.organizationId,
            role: "COMPANY_ADMIN",
          },
        });

        if (!existingAdmin) {
          await tx.organizationMember.updateMany({
            where: {
              userId: req.user.id,
              organizationId: subscription.organizationId,
            },
            data: { role: "COMPANY_ADMIN" },
          });
        }

        // 7️⃣ Update subscription
        await tx.organizationSubscription.update({
          where: { id: invoice.subscriptionId },
          data: {
            status: "ACTIVE",
            billingCycle: invoice.billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            nextBillingDate: periodEnd,
          },
        });

        // 8️⃣ Email info
        const payingMember = await tx.organizationMember.findFirst({
          where: {
            userId: req.user.id,
            organizationId: subscription.organizationId,
          },
          include: { user: { select: { name: true, email: true } } },
        });

        return {
          payingMemberEmail: payingMember?.user?.email ?? null,
          payingMemberName: payingMember?.user?.name ?? null,
        };
      },
      { timeout: 20000 },
    );

    res.status(200).json({
      status: "success",
      message: "Payment Successful",
    });

    // 📧 Email
    if (payingMemberEmail) {
      sendEmail({
        to: payingMemberEmail,
        subject: `🚀 Your ForceHead Plan Has Been Updated to ${plan.tier}`,
        text: "Payment Conformation",
        html: getPlanUpgradeEmailTemplate({
          name: payingMemberName,
          plan: plan.tier,
          billing: invoice.billingCycle,
          validUntil: new Date(periodEnd).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          limits: plan.limits,
        }),
      }).catch((err) => console.log("Plan upgrade email failed:", err.message));
    }
  } catch (error) {
    console.log("Payment verification failed:", error.message);
    handleError(error, req, res);
    res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};

/**
 * Assign an existing unassigned license to a member.
 * Only COMPANY_ADMIN can call this.
 */
const assignLicense = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { memberId, seatId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        status: "error",
        message: "memberId is required",
      });
    }

    // Verify member belongs to admin's org
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== organizationId) {
      return res.status(404).json({
        status: "error",
        message: "Member not found in your organization",
      });
    }

    // Find the org's active subscription
    const subscription = await prisma.organizationSubscription.findFirst({
      where: { organizationId, status: "ACTIVE" },
    });

    if (!subscription) {
      return res.status(400).json({
        status: "error",
        message: "No active subscription found for your organization",
      });
    }

    // If admin picked a specific seat, validate it; otherwise auto-find
    let targetSeat;
    if (seatId) {
      targetSeat = await prisma.licenseSeat.findFirst({
        where: {
          id: seatId,
          subscriptionId: subscription.id,
          assignedToId: null,
          licenses: {
            some: { isActive: true, validUntil: { gte: new Date() } },
          },
        },
        include: {
          licenses: { where: { isActive: true } },
        },
      });
      if (!targetSeat) {
        return res.status(400).json({
          status: "error",
          message:
            "Selected seat is invalid, expired, already assigned, or not in your organization",
        });
      }
    } else {
      targetSeat = await prisma.licenseSeat.findFirst({
        where: {
          subscriptionId: subscription.id,
          assignedToId: null,
          licenses: {
            some: { isActive: true, validUntil: { gte: new Date() } },
          },
        },
        include: {
          licenses: { where: { isActive: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!targetSeat) {
      return res.status(400).json({
        status: "error",
        message: "No available license seats. Please purchase more licenses.",
      });
    }

    // If member already has a seat, unassign it first
    const existingSeat = await prisma.licenseSeat.findFirst({
      where: { assignedToId: memberId },
      include: { licenses: { where: { isActive: true } } },
    });

    await prisma.$transaction(async (tx) => {
      if (existingSeat) {
        await tx.licenseSeat.update({
          where: { id: existingSeat.id },
          data: { assignedToId: null },
        });
        if (existingSeat.licenses[0]) {
          await tx.license.update({
            where: { id: existingSeat.licenses[0].id },
            data: { assignedToId: null },
          });
        }
      }

      await tx.licenseSeat.update({
        where: { id: targetSeat.id },
        data: { assignedToId: memberId },
      });
      if (targetSeat.licenses[0]) {
        await tx.license.update({
          where: { id: targetSeat.licenses[0].id },
          data: { assignedToId: memberId },
        });
      }
    });

    return res.status(200).json({
      status: "success",
      message: "License assigned successfully",
    });
  } catch (error) {
    console.error("assignLicense error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to assign license",
    });
  }
};

/**
 * Get all licenses for the org with assignment info.
 * Only COMPANY_ADMIN can call this.
 */
const getOrgLicenses = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "No subscription found" });
    }

    const seats = await prisma.licenseSeat.findMany({
      where: {
        subscriptionId: subscription.id,
        licenses: {
          some: {
            isActive: true,
            plan: { tier: { not: "BASIC" } },
          },
        },
      },
      include: {
        licenses: {
          where: { isActive: true },
          include: { plan: { select: { tier: true, name: true } } },
        },
        assignedTo: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      status: "success",
      licenses: seats.map((seat) => {
        const license = seat.licenses[0];
        return {
          id: seat.id,
          seatId: seat.id,
          licenseId: license?.id ?? null,
          plan: license?.plan.tier,
          planName: license?.plan.name,
          validUntil: license?.validUntil,
          isAssigned: !!seat.assignedToId,
          assignedTo: seat.assignedTo
            ? {
                memberId: seat.assignedTo.id,
                userId: seat.assignedTo.user.id,
                name: seat.assignedTo.user.name,
                email: seat.assignedTo.user.email,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("getOrgLicenses error:", error.message);
    handleError(error, req, res);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch licenses" });
  }
};

const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        limits: true,
      },
      orderBy: {
        monthlyPrice: "asc",
      },
    });

    const formatted = plans.map((plan) => ({
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: plan.limits.map((limit) => ({
        feature: limit.feature,
        period: limit.period,
        maxAllowed: limit.maxAllowed,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.log("error getsubscription", error.message);
    handleError(error, req, res);
    res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};

const getPlanUpgradeEmailTemplate = ({
  name,
  plan,
  billing,
  limits,
  validUntil,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Plan Upgraded – ForceHead</title>
</head>
<body style="margin:0; padding:0; background:#f0f4ff; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:14px;
                 box-shadow: 0 8px 30px rgba(0,0,0,0.08); overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
                        padding: 32px 30px; text-align:center; color:white;">
              <div style="font-size:32px; margin-bottom:8px;">🚀</div>
              <h1 style="margin:0; font-size:22px; font-weight:700;">
                Plan Upgraded Successfully!
              </h1>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.85;">
                ForceHead – AI Powered Salesforce B2B Network
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 30px;">

              <p style="font-size:15px; color:#1e293b; margin:0 0 6px;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 24px;">
                Great news! Your ForceHead account has been upgraded to the
                <strong style="color:#2563eb;">${plan}</strong> plan.
                Your new features and limits are now active.
              </p>

              <!-- PLAN BADGE -->
              <div style="text-align:center; margin-bottom:24px;">
                <span style="
                  display:inline-block;
                  background:#eff6ff;
                  color:#1d4ed8;
                  border:1.5px solid #bfdbfe;
                  border-radius:100px;
                  padding:10px 28px;
                  font-size:16px;
                  font-weight:700;
                  letter-spacing:0.5px;">
                  ${plan} Plan · ${billing}
                </span>
              </div>

              <!-- PLAN DETAILS BOX -->
              <div style="background:#f8faff; border:1px solid #e0e7ff;
                          border-radius:10px; padding:20px; margin-bottom:20px;">
                <p style="margin:0 0 12px; font-size:13px; font-weight:700;
                           color:#1e3a8a; text-transform:uppercase; letter-spacing:0.8px;">
                  Plan Details
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:#64748b; width:50%;">
                      Valid Until
                    </td>
                    <td style="padding:6px 0; font-size:13px; color:#1e293b;
                               font-weight:600; text-align:right;">
                      ${validUntil}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div style="border-top:1px solid #e2e8f0; margin:4px 0;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:#64748b;">
                      Billing Cycle
                    </td>
                    <td style="padding:6px 0; font-size:13px; color:#1e293b;
                               font-weight:600; text-align:right;">
                      ${billing}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- LIMITS TABLE -->
              <div style="background:#ffffff; border:1px solid #e2e8f0;
                          border-radius:10px; overflow:hidden; margin-bottom:24px;">
                <div style="background:#1e3a8a; padding:12px 16px;">
                  <p style="margin:0; font-size:13px; font-weight:700;
                             color:#ffffff; text-transform:uppercase; letter-spacing:0.8px;">
                    🎯 Your Plan Limits
                  </p>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr style="background:#f1f5f9;">
                    <td style="padding:10px 16px; font-size:12px; font-weight:700;
                               color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">
                      Feature
                    </td>
                    <td style="padding:10px 16px; font-size:12px; font-weight:700;
                               color:#64748b; text-transform:uppercase; letter-spacing:0.5px;
                               text-align:center;">
                      Period
                    </td>
                    <td style="padding:10px 16px; font-size:12px; font-weight:700;
                               color:#64748b; text-transform:uppercase; letter-spacing:0.5px;
                               text-align:right;">
                      Limit
                    </td>
                  </tr>
                  ${limits
                    .map(
                      (l, i) => `
                  <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
                    <td style="padding:11px 16px; font-size:13px; color:#1e293b; font-weight:500;">
                      ${l.feature.replace(/_/g, " ")}
                    </td>
                    <td style="padding:11px 16px; font-size:12px; color:#64748b;
                               text-align:center;">
                      ${l.period}
                    </td>
                    <td style="padding:11px 16px; font-size:13px; color:#2563eb;
                               font-weight:700; text-align:right;">
                      ${l.maxAllowed === 999999 ? "Unlimited" : l.maxAllowed}
                    </td>
                  </tr>`,
                    )
                    .join("")}
                </table>
              </div>

              <p style="font-size:13px; color:#64748b; margin:0 0 24px; line-height:1.6;">
                You can now enjoy your upgraded features. Log in to your dashboard
                to explore everything your new plan has to offer.
              </p>

              <!-- CTA -->
              <div style="text-align:center; margin-bottom:24px;">
                <a href="${process.env.FRONTEND_URL}/company/jobs"
                   style="display:inline-block; padding:13px 32px;
                          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
                          color:#ffffff; text-decoration:none; font-weight:700;
                          border-radius:8px; font-size:14px;">
                  Go to Dashboard →
                </a>
              </div>

              <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.6;">
                If you did not make this purchase or have any concerns,
                please contact our support immediately.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8faff; padding:16px; text-align:center;
                        font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0;">
              © ${new Date().getFullYear()} ForceHead. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getSubscriptionStatus = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;

    // 1️⃣ Get organization member
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        userId,
        // organizationId,
      },
      select: { id: true },
    });

    if (!orgMember) {
      return res.status(404).json({
        status: "error",
        message: "Organization member not found",
      });
    }

    // 2️⃣ Get subscription
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No subscription found",
      });
    }

    // 3️⃣ Resolve seat → active license
    const activeSeat = await prisma.licenseSeat.findFirst({
      where: { assignedToId: orgMember.id },
      include: {
        licenses: {
          where: { isActive: true },
          include: { plan: { select: { tier: true, name: true } } },
        },
      },
    });

    const activeLicense = activeSeat?.licenses[0] ?? null;

    return res.status(200).json({
      status: "success",
      subscription: {
        id: subscription.id,
        planTier: activeLicense?.plan?.tier || "BASIC",
        planName: activeLicense?.plan?.name || "Basic",
        billingCycle: subscription.billingCycle,
        subscriptionStatus: subscription.status,
        autoRenew: subscription.autoRenew,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingDate: subscription.nextBillingDate,
      },
    });
  } catch (error) {
    logger.error("getSubscriptionStatus error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription",
      metadata: error.message,
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "No subscription found" });
    }

    await prisma.organizationSubscription.update({
      where: { organizationId },
      data: { status: "CANCELLED" },
    });

    return res.status(200).json({
      status: "success",
      message:
        "Subscription is Paused. Your plan remains active until the current period ends.",
    });
  } catch (error) {
    logger.error("cancelSubscription error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to cancel subscription",
      metadata: error.message,
    });
  }
};
const getUserLicenseTier = async (req, res) => {
  try {
    const userId = req.user?.id; // assuming auth middleware

    // 1️⃣ Get organization member
    const member = await prisma.organizationMember.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "User is not part of any organization",
      });
    }

    // 2️⃣ Resolve seat → active license
    const activeSeat = await prisma.licenseSeat.findFirst({
      where: { assignedToId: member.id },
      include: {
        licenses: {
          where: { isActive: true },
          include: { plan: { select: { id: true, name: true, tier: true } } },
        },
      },
    });

    const license = activeSeat?.licenses[0] ?? null;

    // 3️⃣ Return plan tier
    return res.status(200).json({
      success: true,
      data: {
        hasLicense: !!license,
        seatId: activeSeat?.id ?? null,
        planId: license?.plan.id ?? null,
        planName: license?.plan.name ?? null,
        tier: license?.plan.tier ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching user license tier:", error);
    handleError(error, req, res);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const reEnableAutoRenew = async (req, res) => {
//   try {
//     const { organizationId } = req.user;

//     await prisma.organizationSubscription.update({
//       where: { organizationId },
//       data: { autoRenew: true },
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Auto-renewal re-enabled.",
//     });
//   } catch (error) {
//     logger.error("reEnableAutoRenew error:", error.message);
//     return res
//       .status(500)
//       .json({ status: "error", message: "Failed to re-enable auto-renewal", metadata: error.message });
//   }
// };

export {
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getSubscriptionPlans,
  assignLicense,
  getOrgLicenses,
  getSubscriptionStatus,
  cancelSubscription,
  getUserLicenseTier,
  // reEnableAutoRenew,
};
