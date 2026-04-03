import prisma from "../../config/prisma.js";
import crypto from "crypto";
import { resolvePromo } from "../utils/promoUtils.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /admin/promo/create
// ─────────────────────────────────────────────────────────────────────────────
export const createPromoCode = async (req, res) => {
  try {
    let {
      code,
      discountType,
      discountValue,
      applicablePlans = [],
      validFrom,
      validTo,
      maxTotalUsages,
    } = req.body;

    if (!["PERCENTAGE", "FLAT"].includes(discountType)) {
      return res.status(400).json({
        status: "error",
        message: "discountType must be PERCENTAGE or FLAT",
      });
    }

    if (!discountValue || discountValue <= 0) {
      return res.status(400).json({
        status: "error",
        message: "discountValue must be greater than 0",
      });
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return res.status(400).json({
        status: "error",
        message: "Percentage discount cannot exceed 100",
      });
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        status: "error",
        message: "validFrom and validTo are required",
      });
    }

    if (new Date(validTo) <= new Date(validFrom)) {
      return res.status(400).json({
        status: "error",
        message: "validTo must be after validFrom",
      });
    }

    if (!code || code.trim() === "") {
      const rand = () => crypto.randomBytes(2).toString("hex").toUpperCase();
      code = `PROMO-${rand()}-${rand()}`;
    } else {
      code = code.trim().toUpperCase();
    }

    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "Promo code already exists",
      });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue,
        applicablePlans,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        maxTotalUsages: maxTotalUsages ?? -1,
        createdById: req.user?.id ?? null,
      },
    });

    return res.status(201).json({ status: "success", data: promo });
  } catch (error) {
    console.error("createPromoCode error:", error.message);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/promo/list
// ─────────────────────────────────────────────────────────────────────────────
export const listPromoCodes = async (req, res) => {
  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { usages: true } } },
    });
    return res.status(200).json({ status: "success", data: promos });
  } catch (error) {
    console.error("listPromoCodes error:", error.message);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /admin/promo/:id/toggle
// ─────────────────────────────────────────────────────────────────────────────
export const togglePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await prisma.promoCode.findUnique({ where: { id } });

    if (!promo) {
      return res
        .status(404)
        .json({ status: "error", message: "Promo code not found" });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: { isActive: !promo.isActive },
    });

    return res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    console.error("togglePromoCode error:", error.message);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /billing/promo/validate
// Preview-only — does NOT record usage.
// ─────────────────────────────────────────────────────────────────────────────
