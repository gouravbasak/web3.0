// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendLoginOtpEmail } = require('../utils/sendEmail');
const userAuth = require('../middlewares/userAuth'); // ✅ Import your middleware

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/signup requests per window
  message: { message: 'Too many attempts from this IP, please try again after 15 minutes' }
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/"
};

// helper to generate JWT
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
       phone: "", // Initialize phone as empty string
      vouchers: [] // Initialize empty vouchers array
    });

    const token = generateToken(user._id);

    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =====================================================
   EMAIL OTP LOGIN ROUTES
===================================================== */

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 OTP requests per IP per 15 minutes
  message: { message: 'Too many OTP requests from this IP. Please try again after 15 minutes.' }
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 verification attempts per IP per 15 minutes
  message: { message: 'Too many OTP verification attempts. Please try again after 15 minutes.' }
});

// POST /api/auth/send-login-otp
router.post('/send-login-otp', otpSendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address. Please sign up first.' });
    }

    // 60-second cooldown check to prevent email flooding
    const recentOtp = await Otp.findOne({
      email: cleanEmail,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Sent within last 60 seconds
    });

    if (recentOtp) {
      return res.status(429).json({ message: 'Please wait 60 seconds before requesting another OTP.' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear previous OTPs for this email and save new OTP
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp: otpCode });

    // Send email
    await sendLoginOtpEmail({
      to: cleanEmail,
      name: user.name,
      otp: otpCode,
    });

    res.json({ message: 'A 6-digit OTP has been sent to your email address.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-login-otp
router.post('/verify-login-otp', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Verify OTP record
    const otpRecord = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP passcode. Please try again.' });
    }

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail });

    // Fetch user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Issue token
    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
});

/* =====================================================
   HELPER: EVALUATE & GRANT REWARD VOUCHERS
===================================================== */
const Order = require("../models/Order");

async function evaluateAndGrantVouchers(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let updated = false;

    // Get all valid non-cancelled orders for user
    const validOrders = await Order.find({
      userId,
      status: { $ne: "Cancelled" },
    });

    // 1️⃣ RULE A: Single order > ₹5,000 -> 15% OFF Coupon (Capping ₹400)
    for (const order of validOrders) {
      const orderAmount = order.payableAmount || order.total || 0;
      if (orderAmount >= 5000) {
        const alreadyGranted = user.vouchers.some(
          (v) =>
            v.generatedFrom?.orderId === (order.orderId || order._id.toString())
        );

        if (!alreadyGranted) {
          user.vouchers.push({
            code: `VIP15-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            title: "15% OFF VIP Reward",
            description: "15% OFF up to ₹400 on purchase for order > ₹5,000",
            amount: 400,
            discountPercent: 15,
            maxDiscount: 400,
            type: "discount",
            generatedFrom: {
              orderId: order.orderId || order._id.toString(),
              reason: "single_order_5000",
              orderDate: order.createdAt,
            },
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            isUsed: false,
            createdAt: new Date(),
          });
          updated = true;
        }
      }
    }

    // 2️⃣ RULE B: Cumulative spend > ₹12,000 -> ₹300 GIFT Voucher
    const totalLifetimeSpend = validOrders.reduce(
      (sum, o) => sum + (o.payableAmount || o.total || 0),
      0
    );

    if (totalLifetimeSpend >= 12000) {
      const alreadyGrantedCumulative = user.vouchers.some(
        (v) => v.generatedFrom?.reason === "cumulative_12000"
      );

      if (!alreadyGrantedCumulative) {
        user.vouchers.push({
          code: `GIFT300-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          title: "₹300 Product Gift Reward",
          description: "Flat ₹300 credit / product reward for milestone > ₹12,000 total spend",
          amount: 300,
          discountPercent: 0,
          maxDiscount: 300,
          type: "gift",
          generatedFrom: {
            reason: "cumulative_12000",
          },
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          isUsed: false,
          createdAt: new Date(),
        });
        updated = true;
      }
    }

    if (updated) {
      await user.save();
    }
  } catch (err) {
    console.error("Error evaluating vouchers:", err);
  }
}

/* =====================================================
   ✅ GET USER VOUCHERS
===================================================== */
router.get("/vouchers", userAuth, async (req, res) => {
  try {
    // Dynamically evaluate orders & grant earned reward vouchers
    await evaluateAndGrantVouchers(req.user.id);

    const user = await User.findById(req.user.id).select("vouchers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter active vouchers (not used and not expired)
    const activeVouchers = user.vouchers.filter(
      (v) => !v.isUsed && new Date(v.expiresAt) > new Date()
    );

    res.json(activeVouchers);
  } catch (err) {
    console.error("Error fetching vouchers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   GET USER PROFILE (Optional)
===================================================== */
router.get("/me", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -vouchers');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* =====================================================
   UPDATE USER PROFILE
===================================================== */
router.put("/me", userAuth, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.passwordHash = await bcrypt.hash(password.trim(), 12);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logout successful' });
});

console.log("✅ Auth routes loaded:");
console.log("   - POST /signup");
console.log("   - POST /login");
console.log("   - POST /send-login-otp");
console.log("   - POST /verify-login-otp");
console.log("   - POST /logout");
console.log("   - GET /vouchers");
console.log("   - GET /me");
console.log("   - PUT /me");
module.exports = router;