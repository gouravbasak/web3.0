const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * CREATE RAZORPAY ORDER
 * POST /api/payments/create-order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount: " + amount });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numAmount * 100), // INR → paise (must be an integer)
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay create order error:", err);
    const errorMsg = err?.error?.description || err?.message || "Failed to create Razorpay order";
    res.status(500).json({ message: errorMsg });
  }
});

/**
 * VERIFY PAYMENT
 * POST /api/payments/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
