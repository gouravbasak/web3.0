const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const { search, sort } = req.query;

    // ✅ Always filter for available products only
    let filter = { status: "available" };
    let sortOption = { createdAt: -1 }; // default

    // 🔍 SEARCH (add search conditions to existing filter)
    if (search && search.trim()) {
      const q = search.trim();
      filter = {
        ...filter,
        $or: [
          { title: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      };
    }

    // ↕️ PRICE SORT
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    }

    if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .lean();

    res.json(products);
  } catch (err) {
    console.error("PUBLIC PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/products/recent
 * Products added in last 7 days (only available ones)
 */
router.get("/recent", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const products = await Product.find({
      status: "available", // ✅ Only available products
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(products);
  } catch (err) {
    console.error("RECENT PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET BEST SELLERS (only available products)
router.get("/best-sellers", async (req, res) => {
  try {
    const products = await Product.find({ 
      status: "available",
      soldCount: { $gt: 10 } // Changed from 2 to 10
    })
      .sort({ soldCount: -1 })
      .limit(4);

    res.json(products);
  } catch (err) {
    console.error("Best sellers error:", err);
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});
  
/**
 * GET /api/products/:id
 * Public single product (check if available)
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Check if product is available
    if (product.status === "unavailable") {
      return res.status(404).json({ message: "Product not available" });
    }

    res.json(product);
  } catch (err) {
    console.error("PUBLIC PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;