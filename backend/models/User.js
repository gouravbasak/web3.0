const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {             
      type: String,
      default: "",
      required: false,  
    },
    acceptedTerms: {
      type: Boolean,
      default: true,
    },
    acceptedTermsAt: {
      type: Date,
      default: Date.now,
    },
    termsVersion: {
      type: String,
      default: "v1.0",
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
     
  vouchers: [{
    code: String,
    title: String,
    description: String,
    amount: Number,
    discountPercent: Number,
    maxDiscount: Number,
    type: {
      type: String,
      enum: ['gift', 'discount', 'referral'],
      default: 'gift'
    },
    generatedFrom: {
      orderId: String,
      reason: String,
      orderDate: Date,
      deliveredDate: Date
    },
    expiresAt: Date,
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date,
    usedOnOrder: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
