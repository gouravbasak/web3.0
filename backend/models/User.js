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
