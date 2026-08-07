const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  actualCost: {
    type: Number,
    required: false,
  },

  mrp: {
    type: Number,
    required: false,
  },

  brand: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  images: {
    type: [String],
    default: [],
  },

  stock: {
    type: Number,
    default: 0,
  },

  soldCount: {
    type: Number,
    default: 0,
  },

   variants: [{
    name: String,
    values: [String],
  }],
  
  // Add this field if it doesn't exist
  variantPricing: [{
    combination: [String],
    price: Number,
    stock: Number,
    sku: String,
  }],
  
   status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },


  // ✅ REVIEW FIELDS MUST BE HERE
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ""
    },
    orderId: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  reviewCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports = mongoose.model("Product", productSchema);