import prisma from "../../config/prisma.js";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — validates a promo code and returns discount details.
// Does NOT record usage. Call this for preview and in createInvoice.
// ─────────────────────────────────────────────────────────────────────────────
export const resolvePromo = async ({ code, planTier, subtotal, userId }) => {
  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    return { valid: false, error: "Invalid or inactive promo code" };
  }

  const now = new Date();
  if (now < promo.validFrom || now > promo.validTo) {
    return {
      valid: false,
      error: "Promo code has expired or is not yet active",
    };
  }

  if (
    promo.maxTotalUsages !== -1 &&
    promo.totalUsages >= promo.maxTotalUsages
  ) {
    return { valid: false, error: "Promo code usage limit reached" };
  }

  if (
    promo.applicablePlans.length > 0 &&
    !promo.applicablePlans.includes(planTier)
  ) {
    return { valid: false, error: "Promo code is not applicable to this plan" };
  }

  const existingUsage = await prisma.promoCodeUsage.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  });

  if (existingUsage) {
    return { valid: false, error: "You have already used this promo code" };
  }

  const savedAmount =
    promo.discountType === "PERCENTAGE"
      ? Math.round((subtotal * promo.discountValue) / 100)
      : Math.min(promo.discountValue, subtotal);

  const newSubtotal = subtotal - savedAmount;

  return {
    valid: true,
    promo,
    discount: {
      type: promo.discountType,
      value: promo.discountValue,
      savedAmount,
      newSubtotal,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal function — must be called inside an existing Prisma $transaction.
// Re-validates everything (race-condition guard), records usage, increments counter.
// Throws on any failure so the outer transaction rolls back.
// ─────────────────────────────────────────────────────────────────────────────
export const applyPromoCodeInTransaction = async (
  tx,
  { code, planTier, subtotal, userId, invoiceId, paymentId },
) => {
  const promo = await tx.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    throw new Error("Invalid or inactive promo code");
  }

  const now = new Date();
  if (now < promo.validFrom || now > promo.validTo) {
    throw new Error("Promo code has expired");
  }

  if (
    promo.maxTotalUsages !== -1 &&
    promo.totalUsages >= promo.maxTotalUsages
  ) {
    throw new Error("Promo code usage limit reached");
  }

  if (
    promo.applicablePlans.length > 0 &&
    !promo.applicablePlans.includes(planTier)
  ) {
    throw new Error("Promo code not applicable to this plan");
  }

  const existingUsage = await tx.promoCodeUsage.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  });

  if (existingUsage) {
    throw new Error("Promo code already used by this user");
  }

  const savedAmount =
    promo.discountType === "PERCENTAGE"
      ? Math.round((subtotal * promo.discountValue) / 100)
      : Math.min(promo.discountValue, subtotal);

  await tx.promoCodeUsage.create({
    data: {
      promoCodeId: promo.id,
      userId,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountedAmount: savedAmount,
      invoiceId,
      paymentId: paymentId ?? null,
    },
  });

  await tx.promoCode.update({
    where: { id: promo.id },
    data: { totalUsages: { increment: 1 } },
  });
};
