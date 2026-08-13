require("dotenv").config({ override: true });
const dns = require("dns");
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

/* ================= MODELS ================= */
const Product = require("./models/Product");

/* ================= ROUTES ================= */
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const orderRoutes = require("./routes/orderRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminStatsRoutes = require("./routes/adminStatsRoutes");
const productRoutes = require("./routes/productRoutes"); // public + search
const paymentRoutes = require("./routes/paymentRoutes"); // Razorpay
const reviewRoutes = require('./routes/reviewRoutes');//reviews
/* ================= MIDDLEWARE ================= */
const authMiddleware = require("./middlewares/auth");

const app = express();
app.disable("etag");

/* ================= GLOBAL MIDDLEWARE ================= */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use('/api/reviews', reviewRoutes);
/* ================= ROUTES ================= */

const uploadRoutes = require("./routes/uploadRoutes");

// Admin authentication (login, logout, me)
app.use("/api/admin", adminAuthRoutes);

// User authentication
app.use("/api/auth", authRoutes);

// Admin image upload (ImageKit)
app.use("/api/admin/upload", uploadRoutes);

// Orders (create, list, update)
app.use("/api/orders", orderRoutes);

// Public products (list + search)
app.use("/api/products", productRoutes);

// Admin products
app.use("/api/admin/products", adminProductRoutes);

// Admin dashboard stats
app.use("/api/admin/stats", adminStatsRoutes);

// Razorpay payments
app.use("/api/payments", paymentRoutes);

/* ================= USER PROFILE ================= */
app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const User = require("./models/User");

    const user = await User.findById(req.userId).select(
      "name email phone"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error in /api/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ADD THIS ROUTE FOR UPDATING PROFILE
app.put("/api/me", authMiddleware, async (req, res) => {
  try {
    const User = require("./models/User");
    const bcrypt = require('bcryptjs');
    
    const { name, phone, password } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    
    // Handle password update
    if (password  && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      updateData.passwordHash = passwordHash;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select("name email phone");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    });
  } catch (err) {
    console.error("Error in PUT /api/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Backend API is working");
});

/* ================= DATABASE ================= */
const connectDB = async () => {
  let primaryUri = (process.env.MONGO_URI || "").trim();
  if (primaryUri.startsWith("MONGO_URI=")) {
    primaryUri = primaryUri.replace(/^MONGO_URI=\s*/, "").trim();
  }
  if (primaryUri.startsWith('"') || primaryUri.startsWith("'")) {
    primaryUri = primaryUri.replace(/^["']|["']$/g, "").trim();
  }

  if (primaryUri && (primaryUri.startsWith("mongodb://") || primaryUri.startsWith("mongodb+srv://"))) {
    try {
      console.log("🔄 Connecting to MongoDB Atlas...");
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        family: 4,
      });
      console.log("✅ Successfully Connected to MongoDB Atlas!");

      app.listen(process.env.PORT || 4000, () => {
        console.log(`🚀 Backend running on port ${process.env.PORT || 4000}`);
      });
      return;
    } catch (err) {
      console.error("❌ MongoDB Atlas Connection Error:", err.message);
    }
  }


  try {
    console.log("🔄 Retrying with local MongoDB (mongodb://127.0.0.1:27017/webs)...");
    await mongoose.connect("mongodb://127.0.0.1:27017/webs");
    console.log("⚠️ WARNING: Connected to Local MongoDB");
  } catch (localErr) {
    console.error("❌ Local MongoDB connection error:", localErr.message);
    process.exit(1);
  }

  app.listen(process.env.PORT || 4000, () => {
    console.log(`🚀 Backend running on port ${process.env.PORT || 4000}`);
  });
};

connectDB();
