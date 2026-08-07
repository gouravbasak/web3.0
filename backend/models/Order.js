const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  title: String,
  price: Number,
  qty: Number,
  size: String,
  image: String,
});

const OrderSchema = new mongoose.Schema(
  {
    // 🔑 NEW: user association
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null, // allows guest checkout
    },

    orderId: { type: String, required: true, unique: true },

    items: [OrderItemSchema],

    originalSubtotal: Number,
    subtotal: Number,
    discount: Number,
    shipping: Number,
    total: Number,

    billing: {
      fullName: String,
      email: String,
      phone: String,
      country: String,
      city: String,
      state: String,
      zip: String,
      line1: String,
    },

   payment: {
  method: String,

  // Razorpay fields
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,

  // (optional – for card details later)
  brand: String,
  last4: String,
},


    // status + audit trail
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        note: String,
        by: String,
      },
    ],
     voucherGenerated: {
    type: Boolean,
    default: false
  },
  
  deliveredAt: {
    type: Date
  }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
