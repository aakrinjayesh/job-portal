// controllers/billing/createInvoice.ts
import prisma from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { getPlanUpgradeEmailTemplate } from "../utils/emailTemplates/BillingTemplates.js";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/handleError.js";
import {
  resolvePromo,
  applyPromoCodeInTransaction,
} from "../admin/utils/promoUtils.js";

const createInvoice = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { planTier, quantity, billingCycle, country, promoCode } = req.body;
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

    let discountedSubtotal = subtotal;
    if (promoCode) {
      const promoResult = await resolvePromo({
        code: promoCode,
        planTier,
        subtotal,
        userId: req.user.id,
      });
      if (!promoResult.valid) {
        return res
          .status(400)
          .json({ status: "error", message: promoResult.error });
      }
      discountedSubtotal = promoResult.discount.newSubtotal;
    }

    const tax =
      detectedCountry === "IN" ? Math.round(discountedSubtotal * 0.18) : 0;
    const total = discountedSubtotal + tax;

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
        subtotal: discountedSubtotal,
        tax,
        total,
        quantity,
        periodStart: now,
        periodEnd,
        dueDate: new Date(Date.now() + 7 * 86400000),
        promoCode: promoCode || null,
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
        const payment = await tx.payment.create({
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

        // 2b️⃣ Apply promo code (if any) — inside transaction for atomicity
        if (invoice.promoCode) {
          const unitPrice =
            invoice.billingCycle === "MONTHLY"
              ? plan.monthlyPrice
              : plan.yearlyPrice;
          const originalSubtotal = unitPrice * invoice.quantity;
          await applyPromoCodeInTransaction(tx, {
            code: invoice.promoCode,
            planTier: invoice.planTier,
            subtotal: originalSubtotal,
            userId: req.user.id,
            invoiceId: invoice.id,
            paymentId: payment.id,
          });
        }

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
          ORGANIZATION: 3,
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
              purchasedById: buyerMember.id,
              paymentId: payment.id,
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
                purchasedById: buyerMember.id,
                paymentId: payment.id,
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
                purchasedById: buyerMember.id,
                paymentId: payment.id,
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
                purchasedById: buyerMember.id,
                paymentId: payment.id,
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
          licenses: { where: { isActive: true, validUntil: { gte: new Date() } }, orderBy: { validUntil: "desc" } },
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
          licenses: { where: { isActive: true, validUntil: { gte: new Date() } }, orderBy: { validUntil: "desc" } },
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
          where: { isActive: true, validUntil: { gte: new Date() } },
          orderBy: { validUntil: "desc" },
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
          where: { isActive: true, validUntil: { gte: new Date() } },
          orderBy: { validUntil: "desc" },
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

const validatePromoCode = async (req, res) => {
  try {
    const { code, planTier, quantity, billingCycle } = req.body;
    const userId = req.user.id;

    if (!code || !planTier || !quantity || !billingCycle) {
      return res
        .status(400)
        .json({ valid: false, error: "Missing required fields" });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: planTier },
    });

    if (!plan) {
      return res.status(400).json({ valid: false, error: "Invalid plan" });
    }

    const rawBillingCycle = billingCycle.toUpperCase();
    const unitPrice =
      rawBillingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;
    const subtotal = unitPrice * quantity;

    const result = await resolvePromo({ code, planTier, subtotal, userId });

    if (!result.valid) {
      return res.status(200).json({ valid: false, error: result.error });
    }

    return res.status(200).json({
      valid: true,
      promoId: result.promo.id,
      discount: result.discount,
    });
  } catch (error) {
    console.error("validatePromoCode error:", error.message);
    return res.status(500).json({ valid: false, error: "Server error" });
  }
};

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
  validatePromoCode,
};
