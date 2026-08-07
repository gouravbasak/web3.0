const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const adminAuth = require("../middlewares/adminAuth");

router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const last30 = new Date(now.setDate(now.getDate() - 30));

    // --- TOTAL ORDERS (LAST 30 DAYS)
    const ordersLast30 = await Order.countDocuments({
      createdAt: { $gte: last30 },
    });

    // --- REVENUE (LAST 30 DAYS)
    const revenueLast30Agg = await Order.aggregate([
      { $match: { createdAt: { $gte: last30 } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const revenueLast30 = revenueLast30Agg?.[0]?.total || 0;

    // --- ORDERS BY STATUS
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusMap = {};
    ordersByStatus.forEach(s => statusMap[s._id] = s.count);

    // --- LOW STOCK (stock < 10)
    const lowStock = await Product.find({ stock: { $lt: 10 } })
      .select("title stock")
      .limit(10);

    // --- TOTAL SALES (ALL TIME)
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalSales = totalSalesAgg?.[0]?.total || 0;

    // --- PAYMENT MODES
    const payments = await Order.aggregate([
      { $group: { _id: "$payment.method", count: { $sum: 1 } } }
    ]);

    const paymentModes = {};
    payments.forEach(p => paymentModes[p._id] = p.count);

    res.json({
      ordersLast30,
      revenueLast30,
      ordersByStatus: statusMap,
      lowStock,
      totalSales,
      paymentModes
    });

  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
