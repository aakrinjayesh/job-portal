import prisma from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";
import { handleError } from "../utils/handleError.js";

const GST_RATE = 0.18;

// ─────────────────────────────────────────────────────────────────────────────
// GET /billing/renew
// Returns seat info + plan pricing for the renewal page
// ─────────────────────────────────────────────────────────────────────────────

export const getRenewalInfo = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
      include: {
        seats: {
          where: {
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
              include: { plan: true },
            },
            assignedTo: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No subscription found",
      });
    }

    const renewableSeats = subscription.seats.filter(
      (s) => s.licenses.length > 0,
    );

    if (renewableSeats.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active licenses found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        currentLicenseCount: renewableSeats.length,

        licenses: renewableSeats.map((seat) => {
          const license = seat.licenses[0];
          return {
            seatId: seat.id,
            validUntil: license.validUntil,

            plan: {
              id: license.plan.id,
              name: license.plan.name,
              tier: license.plan.tier,
              monthlyPrice: license.plan.monthlyPrice,
              yearlyPrice: license.plan.yearlyPrice,
            },

            assignedTo: seat.assignedTo
              ? {
                  id: seat.assignedTo.id,
                  name: seat.assignedTo.user?.name,
                  email: seat.assignedTo.user?.email,
                }
              : null,
          };
        }),

        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    logger.error("getRenewalInfo error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to get renewal info",
      metadata: error.message,
    });
  }
};

export const createRenewalOrder = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { seatIds, billingCycle, country } = req.body;

    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "seatIds must be a non-empty array",
      });
    }

    const rawBillingCycle = billingCycle?.toUpperCase();
    if (!["MONTHLY", "YEARLY"].includes(rawBillingCycle)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid billing cycle",
      });
    }

    // ── Fetch subscription ───────────────────────────────────────────────────
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "Subscription not found",
      });
    }

    // ── Validate seats belong to this subscription and have active non-BASIC licenses
    const seats = await prisma.licenseSeat.findMany({
      where: {
        id: { in: seatIds },
        subscriptionId: subscription.id,
      },
      include: {
        licenses: {
          where: { isActive: true, validUntil: { gte: new Date() } },
          orderBy: { validUntil: "desc" },
          include: { plan: true },
        },
      },
    });

    const renewableSeats = seats.filter(
      (s) => s.licenses.length > 0 && s.licenses[0].plan.tier !== "BASIC",
    );

    if (renewableSeats.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid active seats found for the provided IDs",
      });
    }

    if (renewableSeats.length !== seatIds.length) {
      return res.status(400).json({
        status: "error",
        message:
          "Some seatIds are invalid, inactive, or do not belong to your subscription",
      });
    }

    // ── Detect country ───────────────────────────────────────────────────────
    const address = await prisma.address.findUnique({
      where: { organizationId },
    });
    const detectedCountry = address?.country || country || "IN";

    // ── Calculate totals per seat's active license plan ──────────────────────
    const subtotal = renewableSeats.reduce((sum, seat) => {
      const license = seat.licenses[0];
      const unitPrice =
        rawBillingCycle === "MONTHLY"
          ? license.plan.monthlyPrice
          : license.plan.yearlyPrice;
      return sum + unitPrice;
    }, 0);

    const tax = detectedCountry === "IN" ? Math.round(subtotal * GST_RATE) : 0;
    const total = subtotal + tax;

    // ── Period calculation ───────────────────────────────────────────────────
    const now = new Date();
    const periodEnd =
      rawBillingCycle === "MONTHLY"
        ? new Date(new Date().setMonth(now.getMonth() + 1))
        : new Date(new Date().setFullYear(now.getFullYear() + 1));

    // ── Create pending invoice ───────────────────────────────────────────────
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: `RNW-${Date.now()}`,
        status: "PENDING",
        billingCycle: rawBillingCycle,
        planTier: renewableSeats[0].licenses[0].plan.tier,
        subtotal,
        tax,
        total,
        quantity: renewableSeats.length,
        periodStart: now,
        periodEnd,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });

    // ── Create Razorpay order ────────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
        seatIds: seatIds.join(","),
        type: "RENEWAL",
      },
    });

    return res.status(200).json({
      status: "success",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      invoiceId: invoice.id,
    });
  } catch (error) {
    logger.error("createRenewalOrder error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Failed to create renewal order",
      metadata: error.message,
    });
  }
};

export const verifyRenewalPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId,
    } = req.body;

    // ── 1. Verify Razorpay signature ─────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment signature",
      });
    }

    // ── 2. Fetch invoice ─────────────────────────────────────────────────────
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }

    if (invoice.status === "PAID") {
      return res.status(200).json({
        status: "success",
        message: "Already processed",
      });
    }

    // ── 3. Get seatIds from Razorpay order notes ──────────────────────────────
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const seatIds = razorpayOrder.notes?.seatIds?.split(",").filter(Boolean);

    if (!seatIds || seatIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Could not determine seats to renew from order",
      });
    }

    // ── 4. Fetch subscription ────────────────────────────────────────────────
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { id: invoice.subscriptionId },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "Subscription not found",
      });
    }

    // ── 5. Fetch seats with their active licenses ─────────────────────────────
    const seats = await prisma.licenseSeat.findMany({
      where: {
        id: { in: seatIds },
        subscriptionId: subscription.id,
      },
      include: {
        licenses: { where: { isActive: true }, orderBy: { validUntil: "desc" } },
      },
    });

    if (seats.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No seats found to renew",
      });
    }

    const now = new Date();

    // ── 6. Compute new validity per seat ─────────────────────────────────────
    const seatRenewals = seats.map((seat) => {
      const oldLicense = seat.licenses[0];

      const isExpired = oldLicense ? oldLicense.validUntil <= now : true;

      const newValidFrom = isExpired ? now : oldLicense.validUntil;

      const newValidUntil =
        invoice.billingCycle === "MONTHLY"
          ? new Date(
              new Date(newValidFrom).setMonth(newValidFrom.getMonth() + 1),
            )
          : new Date(
              new Date(newValidFrom).setFullYear(
                newValidFrom.getFullYear() + 1,
              ),
            );

      return { seat, oldLicense, newValidFrom, newValidUntil, isExpired };
    });

    // ── 7. Latest validUntil across renewed seats (for subscription sync) ─────
    const latestValidUntil = seatRenewals.reduce(
      (latest, { newValidUntil }) =>
        newValidUntil > latest ? newValidUntil : latest,
      seatRenewals[0].newValidUntil,
    );

    // ── 8. Transaction ────────────────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      // Mark invoice PAID
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: now },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: "INR",
          status: "COMPLETED",
          gateway: "RAZORPAY",
          gatewayPaymentId: razorpay_payment_id,
          gatewaySessionId: razorpay_order_id,
        },
      });

      // For each seat: handle chained vs expired renewal
      for (const {
        seat,
        oldLicense,
        newValidFrom,
        newValidUntil,
        isExpired,
      } of seatRenewals) {
        if (isExpired && oldLicense) {
          await tx.license.update({
            where: { id: oldLicense.id },
            data: { isActive: false },
          });
          await tx.license.create({
            data: {
              subscriptionId: subscription.id,
              planId: oldLicense.planId,
              seatId: seat.id,
              assignedToId: seat.assignedToId,
              paymentId: payment.id,
              purchasedById: seat.assignedToId,
              validFrom: newValidFrom,
              validUntil: newValidUntil,
              isActive: true,
            },
          });
        } else {
          await tx.license.create({
            data: {
              subscriptionId: subscription.id,
              planId: oldLicense?.planId,
              seatId: seat.id,
              assignedToId: seat.assignedToId,
              paymentId: payment.id,
              purchasedById: seat.assignedToId,
              validFrom: newValidFrom,
              validUntil: newValidUntil,
              isActive: false,
            },
          });
        }
      }

      // Sync subscription period to latest renewed seat
      await tx.organizationSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          billingCycle: invoice.billingCycle,
          currentPeriodStart: now,
          currentPeriodEnd: latestValidUntil,
          nextBillingDate: latestValidUntil,
        },
      });
    });

    return res.status(200).json({
      status: "success",
      message: "Renewal successful",
    });
  } catch (error) {
    logger.error("verifyRenewalPayment error:", error.message);
    handleError(error, req, res);
    return res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};
