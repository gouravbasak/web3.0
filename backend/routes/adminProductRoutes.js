// routes/adminProductRoutes.js
const express = require("express");
const Product = require("../models/Product");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

// GET ALL PRODUCTS (ADMIN)
router.get("/", adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("ADMIN GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE PRODUCT (ADMIN)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("ADMIN GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE PRODUCT (ADMIN)
router.post("/", adminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };

    // sanitize numeric fields
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.actualCost !== undefined)
      payload.actualCost = Number(payload.actualCost);
    if (payload.mrp !== undefined) payload.mrp = Number(payload.mrp);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const product = await Product.create(payload);
    res.json(product);
  } catch (err) {
    console.error("ADMIN CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PRODUCT (ADMIN)
// Supports:
//  - normal updates: body contains fields to replace
//  - stock adjust: body contains { $incStock: number } to increment/decrement stock atomically
router.put("/:id", adminAuth, async (req, res) => {
  try {
    // Atomic stock update
    if (typeof req.body.$incStock !== "undefined") {
      const incVal = Number(req.body.$incStock);
      if (Number.isNaN(incVal)) {
        return res.status(400).json({ message: "$incStock must be a number" });
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { $inc: { stock: incVal } },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "Product not found" });
      return res.json(updated);
    }

    // Normal update payload
    const payload = { ...req.body };

    // sanitize numeric fields
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.actualCost !== undefined)
      payload.actualCost = Number(payload.actualCost);
    if (payload.mrp !== undefined) payload.mrp = Number(payload.mrp);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// TOGGLE FEATURED / AD STATUS (ADMIN)
router.patch("/:id/toggle-featured", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ ok: true, isFeatured: product.isFeatured, product });
  } catch (err) {
    console.error("ADMIN TOGGLE FEATURED ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE PRODUCT (ADMIN)

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("ADMIN DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
