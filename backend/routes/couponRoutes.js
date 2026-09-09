const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const adminAuth = require("../middlewares/adminAuth");

/* =====================================================
   PUBLIC: VALIDATE COUPON AT CHECKOUT
===================================================== */
router.post("/validate", async (req, res) => {
  try {
    const { code, cartSubtotal } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const subtotal = Number(cartSubtotal || 0);
    const cleanCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    const now = new Date();

    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return res.status(400).json({ message: "This coupon is not yet active" });
    }

    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required for this coupon`,
      });
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its maximum usage limit" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // flat discount
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderAmount: coupon.minOrderAmount,
      },
      message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount.toLocaleString("en-IN")}`,
    });
  } catch (err) {
    console.error("Validate coupon error:", err);
    res.status(500).json({ message: "Server error validating coupon" });
  }
});

/* =====================================================
   ADMIN: GET ALL COUPONS
===================================================== */
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    console.error("Admin get coupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN: CREATE COUPON
===================================================== */
router.post("/admin", adminAuth, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    if (discountValue === undefined || discountValue === null || Number(discountValue) <= 0) {
      return res.status(400).json({ message: "A valid positive discount value is required" });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code "${cleanCode}" already exists` });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      description: description || "",
      discountType: discountType === "flat" ? "flat" : "percentage",
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, coupon, message: `Coupon ${cleanCode} created successfully` });
  } catch (err) {
    console.error("Admin create coupon error:", err);
    res.status(500).json({ message: "Server error creating coupon" });
  }
});

/* =====================================================
   ADMIN: UPDATE COUPON
===================================================== */
router.put("/admin/:id", adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const fields = [
      "description",
      "discountType",
      "discountValue",
      "maxDiscountAmount",
      "minOrderAmount",
      "usageLimit",
      "validFrom",
      "validUntil",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "validUntil" || field === "validFrom") {
          coupon[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          coupon[field] = req.body[field];
        }
      }
    });

    if (req.body.code && req.body.code.trim()) {
      coupon.code = req.body.code.trim().toUpperCase();
    }

    await coupon.save();
    res.json({ success: true, coupon, message: "Coupon updated successfully" });
  } catch (err) {
    console.error("Admin update coupon error:", err);
    res.status(500).json({ message: "Server error updating coupon" });
  }
});

/* =====================================================
   ADMIN: DELETE COUPON
===================================================== */
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ success: true, message: `Coupon "${coupon.code}" deleted` });
  } catch (err) {
    console.error("Admin delete coupon error:", err);
    res.status(500).json({ message: "Server error deleting coupon" });
  }
});

module.exports = router;
