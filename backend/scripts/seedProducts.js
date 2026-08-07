require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/webs";

const sampleProducts = [
  {
    title: "Pro Carbon Cricket Bat",
    description: "Handcrafted English Willow cricket bat with premium grain structure and power stroke balance.",
    price: 4999,
    mrp: 6999,
    actualCost: 3200,
    brand: "SG",
    category: "Cricket",
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop"
    ],
    stock: 25,
    soldCount: 18,
    status: "available",
    variants: [
      { name: "Size", values: ["SH", "H", "6"] }
    ],
    variantPricing: [
      { combination: ["SH"], price: 4999, stock: 15, sku: "BAT-SH" },
      { combination: ["H"], price: 4499, stock: 10, sku: "BAT-H" }
    ],
    averageRating: 4.8,
    reviewCount: 12
  },
  {
    title: "Match Master Football Size 5",
    description: "FIFA quality approved match ball with thermal bonded seamless surface for predictable trajectory.",
    price: 1899,
    mrp: 2499,
    actualCost: 1100,
    brand: "Adidas",
    category: "Football",
    images: [
      "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&auto=format&fit=crop"
    ],
    stock: 40,
    soldCount: 32,
    status: "available",
    variants: [
      { name: "Color", values: ["White/Blue", "White/Red"] }
    ],
    averageRating: 4.6,
    reviewCount: 20
  },
  {
    title: "Astro Speed Badminton Racket",
    description: "Lightweight full graphite racket with rotational generator system for fast counter attacks.",
    price: 3499,
    mrp: 4500,
    actualCost: 2100,
    brand: "Yonex",
    category: "Badminton",
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop"
    ],
    stock: 30,
    soldCount: 25,
    status: "available",
    variants: [
      { name: "Flex", values: ["Stiff", "Medium"] }
    ],
    averageRating: 4.9,
    reviewCount: 15
  },
  {
    title: "Air Cushion Running Shoes",
    description: "Breathable mesh running shoes with responsive foam cushioning for long distance endurance.",
    price: 2999,
    mrp: 3999,
    actualCost: 1800,
    brand: "Nike",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop"
    ],
    stock: 50,
    soldCount: 45,
    status: "available",
    variants: [
      { name: "Size", values: ["UK 7", "UK 8", "UK 9", "UK 10"] }
    ],
    averageRating: 4.7,
    reviewCount: 28
  },
  {
    title: "Adjustable Cast Iron Dumbbell Set 20kg",
    description: "Heavy duty cast iron plates with spin-lock collars for safe home workout strength training.",
    price: 3299,
    mrp: 4999,
    actualCost: 2000,
    brand: "Decathlon",
    category: "Fitness",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop"
    ],
    stock: 20,
    soldCount: 14,
    status: "available",
    averageRating: 4.5,
    reviewCount: 10
  },
  {
    title: "Pro Court Tennis Racket",
    description: "Spin grommets technology with open string pattern for maximum spin and control.",
    price: 5499,
    mrp: 7500,
    actualCost: 3500,
    brand: "Babolat",
    category: "Tennis",
    images: [
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop"
    ],
    stock: 15,
    soldCount: 12,
    status: "available",
    averageRating: 4.8,
    reviewCount: 8
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB at", MONGO_URI);

    const existingCount = await Product.countDocuments();
    console.log(`Current products in DB: ${existingCount}`);

    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);
    console.log(`🚀 Successfully seeded ${created.length} products into local MongoDB!`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
