// controllers/billing/createInvoice.ts
import prisma from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";

const createInvoice = async (req, res) => {
  const { organizationId } = req.user;
  const { planTier, quantity, billingCycle } = req.body;
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

  const unitPrice =
    rawBillingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;

  const subtotal = unitPrice * quantity;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const subscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
  });

  if (!subscription) {
    return res.status(404).json({ error: "Subscription not found" });
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
};

const createRazorpayOrder = async (req, res) => {
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
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId,
    } = req.body;

    // 🔐 1️⃣ Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // 🔎 2️⃣ Fetch Invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.json({ success: true });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier: invoice.planTier },
    });

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const now = new Date();
    const periodEnd = invoice.periodEnd;

    await prisma.$transaction(async (tx) => {
      // 🧾 3️⃣ Mark invoice paid
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: now },
      });

      // 💳 4️⃣ Create payment record
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

      // 🔎 5️⃣ Fetch subscription
      const subscription = await tx.organizationSubscription.findUnique({
        where: { id: invoice.subscriptionId },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // 👥 Count members
      const memberCount = await tx.organizationMember.count({
        where: { organizationId: subscription.organizationId },
      });

      // 🎟 Fetch active licenses
      const activeLicenses = await tx.license.findMany({
        where: {
          subscriptionId: invoice.subscriptionId,
          isActive: true,
        },
        include: {
          plan: true,
        },
      });

      // ==================================================
      // 🟢 CASE 1: ONLY 1 MEMBER → PLAN UPGRADE
      // ==================================================
      if (
        memberCount === 1 &&
        activeLicenses.length === 1 &&
        activeLicenses[0].planId !== plan.id
      ) {
        await tx.license.update({
          where: { id: activeLicenses[0].id },
          data: {
            planId: plan.id,
            validFrom: now,
            validUntil: periodEnd,
            isActive: true,
          },
        });
      }

      // ==================================================
      // 🟢 CASE 2: MULTIPLE MEMBERS → ADD NEW SEATS
      // ==================================================
      else if (invoice.quantity > 0) {
        await tx.license.createMany({
          data: Array.from({ length: invoice.quantity }, () => ({
            subscriptionId: invoice.subscriptionId,
            planId: plan.id,
            validFrom: now,
            validUntil: periodEnd,
            isActive: true,
          })),
        });
      }

      // 🔄 6️⃣ Update subscription period
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
    });

    res.status(200).json({
      status: "success",
      message: "Payment Successful",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({
      status: "error",
      message: "Payment verification failed",
    });
  }
};

const getSubscriptionPlans = async (req, res) => {
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
};

export {
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getSubscriptionPlans,
};
