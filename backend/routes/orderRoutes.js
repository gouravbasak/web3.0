// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const userAuth = require("../middlewares/userAuth");
const { sendOrderCreatedEmail } = require("../utils/sendEmail");
/**
 * Helper: try to decrement stock for items one-by-one using a conditional atomic update.
 */
async function decrementStock(items) {
  const updated = [];
  try {
    for (const it of items) {
      const prod = await Product.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: it.qty } },
        { $inc: { stock: -it.qty } },
        { new: true }
      );

      if (!prod) {
        for (const u of updated) {
          await Product.findByIdAndUpdate(u.id, { $inc: { stock: u.qty } });
        }
        return {
          ok: false,
          message: `Insufficient stock for product ${it.productId}`,
        };
      }

      updated.push({ id: it.productId, qty: it.qty });
    }

    return { ok: true, updated };
  } catch (err) {
    for (const u of updated) {
      try {
        await Product.findByIdAndUpdate(u.id, { $inc: { stock: u.qty } });
      } catch (e) {
        console.error("Rollback error", e);
      }
    }
    return { ok: false, message: "Stock update failed", error: err };
  }
}

/* =====================================================
   CREATE ORDER (USER)
===================================================== */
router.post("/", userAuth, async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ message: "Invalid order payload" });
    }

    const items = payload.items.map((i) => ({
      productId: i.productId,
      qty: Number(i.qty || 1),
      size: i.size || null, 
      title: i.title,
      price: i.price,
      image: i.image,
    }));

    // 1️⃣ Decrement stock
    const dec = await decrementStock(items);
    if (!dec.ok) {
      return res.status(400).json({ message: dec.message });
    }

    // 2️⃣ Create order
    const order = await Order.create({
      ...payload,
       billing: {
    ...payload.billing,
    name: payload.billing.fullName, // ✅ THIS LINE
  },
      items,
      userId: req.user.id, // ✅ linked correctly
      createdAt: payload.createdAt || new Date(),
      
    });
    // 2️⃣.5️⃣ Increment soldCount for products
for (const item of items) {
  await Product.findByIdAndUpdate(item.productId, {
    $inc: { soldCount: item.qty },
  });
}

    // 3️⃣ Send email (NON-BLOCKING)
    try {
      await sendOrderCreatedEmail({
        to: payload.billing.email,
        name: payload.billing.name || payload.billing.fullName,
        orderId: order.orderId || order._id.toString(),
        total: order.payableAmount || order.total,
        items: order.items || [],
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr);
      // ❌ do NOT fail order if email fails
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ✅ GET MY ORDERS (USER PROFILE)
===================================================== */
router.get("/my", userAuth, async (req, res) => {
  try {
    console.log("MY ORDERS USER:", req.user); // TEMP DEBUG

    const orders = await Order.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("My orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* =====================================================
   PUBLIC ORDER TRACKING (NO AUTH REQUIRED)
===================================================== */
router.get("/track/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const query = orderId.trim();

    // Find by custom orderId or MongoDB _id
    let order = await Order.findOne({ orderId: query });
    if (!order && query.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(query);
    }

    if (!order) {
      return res.status(404).json({ message: "No order found matching this Order ID" });
    }

    return res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: order.orderId || order._id.toString(),
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        payableAmount: order.payableAmount || order.total,
        items: order.items,
        statusHistory: order.statusHistory || [],
        billing: {
          name: order.billing?.fullName || order.billing?.name || "Customer",
          city: order.billing?.city || "",
          pincode: order.billing?.pincode || "",
          paymentMethod: order.billing?.paymentMethod || "Prepaid",
        },
      },
    });
  } catch (err) {
    console.error("Public track order error:", err);
    res.status(500).json({ message: "Server error tracking order" });
  }
});

/* =====================================================
   CANCEL ORDER (USER)
===================================================== */
router.put("/:id/cancel", userAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 Ownership check
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ❌ Already cancelled / shipped
    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled" });
    }

    // 🔄 Restore stock & rollback soldCount
for (const item of order.items) {
  await Product.findByIdAndUpdate(item.productId, {
    $inc: {
      stock: item.qty,
      soldCount: -item.qty,
    },
  });
}


    // 🛑 Update order
    order.status = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      at: new Date(),
      by: "user",
    });

    await order.save();

    // 📧 SEND EMAIL (NON-BLOCKING)
    try {
      await sendOrderCancelledEmail({
        to: order.billing.email,
        name: order.billing.name,
        orderId: order.orderId,
        total: order.total,
      });
    } catch (err) {
      console.error("Cancel email failed:", err);
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN: GET ALL ORDERS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Order list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN: GET SINGLE ORDER
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
===================================================== */
const { sendOrderCancelledEmail } = require("../utils/sendEmail");

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;

    order.status = status;
     if (status === "Delivered" && previousStatus !== "Delivered") {
      order.deliveredAt = new Date();
    }

    order.statusHistory.push({
      status,
      at: new Date(),
      note: "",
      by: "admin",
    });

    await order.save();

    // 🔔 SEND EMAIL ONLY WHEN CANCELLED
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      try {
        await sendOrderCancelledEmail({
          to: order.billing.email,
          name: order.billing.name,
          orderId: order.orderId,
          total: order.total,
        });
      } catch (emailErr) {
        console.error("Cancel email failed:", emailErr);
      }
    }

    res.json(order);
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;