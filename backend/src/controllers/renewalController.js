import prisma from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";

const GST_RATE = 0.18;

// ─────────────────────────────────────────────────────────────────────────────
// GET /billing/renew
// Returns current license info + plan pricing for the renewal page
// ─────────────────────────────────────────────────────────────────────────────

export const getRenewalInfo = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
      include: {
        licenses: {
          where: {
            isActive: true,
            plan: {
              tier: { not: "BASIC" }, // ✅ Exclude free tier at DB level
            },
          },
          include: {
            plan: true,
            assignedTo: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
          orderBy: [{ assignedToId: "desc" }, { validUntil: "asc" }],
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No subscription found",
      });
    }

    const activeLicenses = subscription.licenses;

    if (activeLicenses.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active licenses found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        currentLicenseCount: activeLicenses.length,

        licenses: activeLicenses.map((l) => ({
          id: l.id,
          validUntil: l.validUntil,

          // ✅ PLAN INSIDE LICENSE
          plan: {
            id: l.plan.id,
            name: l.plan.name,
            tier: l.plan.tier,
            monthlyPrice: l.plan.monthlyPrice,
            yearlyPrice: l.plan.yearlyPrice,
          },

          assignedTo: l.assignedTo
            ? {
                id: l.assignedTo.id,
                name: l.assignedTo.user?.name,
                email: l.assignedTo.user?.email,
              }
            : null,
        })),

        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    logger.error("getRenewalInfo error:", error.message);
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
    const { licenseIds, billingCycle, country } = req.body;

    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!Array.isArray(licenseIds) || licenseIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "licenseIds must be a non-empty array",
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

    // ── Validate licenses belong to this subscription ────────────────────────
    const licenses = await prisma.license.findMany({
      where: {
        id: { in: licenseIds },
        subscriptionId: subscription.id,
        isActive: true,
        plan: { tier: { not: "BASIC" } },
      },
      include: { plan: true },
    });

    if (licenses.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid active licenses found for the provided IDs",
      });
    }

    if (licenses.length !== licenseIds.length) {
      return res.status(400).json({
        status: "error",
        message:
          "Some licenseIds are invalid, inactive, or do not belong to your subscription",
      });
    }

    // ── Detect country (same as createInvoice) ───────────────────────────────
    const address = await prisma.address.findUnique({
      where: { userId: req.user.id },
    });
    const detectedCountry = address?.country || country || "IN";

    // ── Calculate totals per license's own plan ──────────────────────────────
    const subtotal = licenses.reduce((sum, l) => {
      const unitPrice =
        rawBillingCycle === "MONTHLY"
          ? l.plan.monthlyPrice
          : l.plan.yearlyPrice;
      return sum + unitPrice;
    }, 0);

    const tax = detectedCountry === "IN" ? Math.round(subtotal * 0.18) : 0;
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
        planTier: licenses[0].plan.tier, // dominant tier for invoice record
        subtotal,
        tax,
        total,
        quantity: licenses.length,
        periodStart: now,
        periodEnd,
        dueDate: new Date(Date.now() + 7 * 86400000), // same as createInvoice
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
        licenseIds: licenseIds.join(","),
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

    // ── 3. Get licenseIds from Razorpay order notes ──────────────────────────
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const licenseIds = razorpayOrder.notes?.licenseIds
      ?.split(",")
      .filter(Boolean);

    if (!licenseIds || licenseIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Could not determine licenses to renew from order",
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

    // ── 5. Fetch the licenses to renew ───────────────────────────────────────
    const licenses = await prisma.license.findMany({
      where: {
        id: { in: licenseIds },
        subscriptionId: subscription.id,
      },
    });

    if (licenses.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No licenses found to renew",
      });
    }

    const now = new Date();

    const licenseUpdates = licenses.map((l) => {
      const isExpired = l.validUntil <= now; // true if already past expiry

      const newValidFrom = isExpired
        ? now // paid late → start fresh from today
        : l.validUntil; // paid early → continue from existing expiry (no gap)

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

      return { id: l.id, newValidFrom, newValidUntil };
    });

    // ── 7. Latest validUntil across all renewed licenses (for subscription sync)
    const latestValidUntil = licenseUpdates.reduce(
      (latest, l) => (l.newValidUntil > latest ? l.newValidUntil : latest),
      licenseUpdates[0].newValidUntil,
    );

    // ── 8. Transaction ───────────────────────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      // Mark invoice PAID
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: now },
      });

      // Create payment record
      await tx.payment.create({
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

      // Update each license individually (different dates per license)
      for (const { id, newValidFrom, newValidUntil } of licenseUpdates) {
        await tx.license.update({
          where: { id },
          data: {
            validFrom: newValidFrom,
            validUntil: newValidUntil,
            isActive: true,
          },
        });
      }

      // Sync subscription period to the latest renewed license
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
    return res.status(500).json({
      status: "error",
      message: "Payment verification failed",
      metadata: error.message,
    });
  }
};
