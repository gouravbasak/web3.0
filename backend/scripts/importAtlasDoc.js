require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/webs";

const atlasDoc = {
  _id: new mongoose.Types.ObjectId("6989ef5f87f827f666276541"),
  title: "Power Bank",
  description: "Solid-state Power Bank 20W PD+15W Qi2 wireless magsafe Charging for iphone, watch and headphone,Bulit-in Stand&Display",
  price: 1700,
  actualCost: 1432,
  mrp: 3000,
  brand: "IONYX",
  category: "Powerbank",
  images: [
    "https://firebasestorage.googleapis.com/v0/b/sports-store-c7541.firebasestorage.app/o/products%2F1770714515367-Gemini_Generated_Image_5s12eq5s12eq5s12.png?alt=media&token=5e248a57-294b-482e-b462-9c9e3bb5491c",
    "https://firebasestorage.googleapis.com/v0/b/sports-store-c7541.firebasestorage.app/o/products%2F1770647488593-Gemini_Generated_Image_h6lbb5h6lbb5h6lb.png?alt=media&token=a05dfb66-5290-487a-bb73-ec4d6c144d72",
    "https://firebasestorage.googleapis.com/v0/b/sports-store-c7541.firebasestorage.app/o/products%2F1770714413287-Gemini_Generated_Image_eusdxveusdxveusd.png?alt=media&token=b6b71e22-6234-40f1-a8ca-f5c9b6dd7d9e"
  ],
  stock: 11,
  soldCount: 9,
  averageRating: 3,
  reviewCount: 2,
  reviews: [
    {
      userId: new mongoose.Types.ObjectId("6985bfb8b760d9740237b2e6"),
      userName: "Rio",
      rating: 4,
      comment: "Nice to carry ",
      orderId: "ORD-4FC72BE1",
      _id: new mongoose.Types.ObjectId("69d781fbc021299105e6b708"),
      createdAt: new Date("2026-04-09T10:39:55.970Z")
    },
    {
      userId: new mongoose.Types.ObjectId("69d78349c021299105e6b76c"),
      userName: "alex",
      rating: 2,
      comment: "less capacity",
      orderId: "ORD-9FAC35EF",
      _id: new mongoose.Types.ObjectId("69d78e66c021299105e6b7be"),
      createdAt: new Date("2026-04-09T11:32:54.792Z")
    }
  ],
  createdAt: new Date("2026-02-09T14:29:51.522Z"),
  status: "available",
  variants: [
    {
      name: "Capacity",
      values: ["5000", "10000", "15000"],
      _id: new mongoose.Types.ObjectId("699d786c8466463b61a02fd2")
    }
  ],
  variantPricing: [
    {
      combination: ["5000"],
      price: 1700,
      stock: 12,
      sku: "5000",
      _id: new mongoose.Types.ObjectId("699d786c8466463b61a02fd3")
    },
    {
      combination: ["10000"],
      price: 2200,
      stock: 4,
      sku: "10000",
      _id: new mongoose.Types.ObjectId("699d786c8466463b61a02fd4")
    },
    {
      combination: ["15000"],
      price: 3200,
      stock: 4,
      sku: "15000",
      _id: new mongoose.Types.ObjectId("699d786c8466463b61a02fd5")
    }
  ]
};

async function importDoc() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to local MongoDB at", MONGO_URI);

    await Product.findByIdAndUpdate(atlasDoc._id, atlasDoc, { upsert: true, new: true });
    console.log("🚀 Successfully imported Power Bank product into local MongoDB!");

    const totalCount = await Product.countDocuments();
    console.log(`Total products in local DB now: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Import error:", err);
    process.exit(1);
  }
}

importDoc();
