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
    // After res.status(200).json({ status: "success" ... })
    // Send upgrade email in background
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId: invoice.organizationId },
      include: { user: true },
    });

    if (member?.user?.email) {
      const limits = plan.limits || [];

      sendEmail({
        to: member.user.email,
        subject: `🚀 Your ForceHead Plan Has Been Upgraded to ${plan.tier}`,
        html: getPlanUpgradeEmailTemplate({
          name: member.user.name,
          plan: plan.tier,
          billing: invoice.billingCycle,
          validUntil: new Date(periodEnd).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          limits: limits,
        }),
      }).catch((err) =>
        logger.error("Plan upgrade email failed:", err.message),
      );
    }
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

export {
  createInvoice,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getSubscriptionPlans,
};
