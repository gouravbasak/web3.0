const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// --- CONFIG ---
const JWT_SECRET = process.env.JWT_ADMIN_SECRET;
const COOKIE_NAME = "adminToken";  // cookie name expected by middleware
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- Helper: sign admin JWT ---
function signAdminToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), email: admin.email, role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const { sendAdminOtpEmail } = require("../utils/sendEmail");

// --- Helper: check if email is an authorized admin ---
function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const allowedEmails = [
    process.env.ADMIN_EMAIL,
    process.env.EMAIL_USER,
  ]
    .filter(Boolean)
    .map((e) => e.toLowerCase().trim());

  return allowedEmails.includes(clean);
}

// =====================================================
//   1️⃣ REQUEST ADMIN OTP CODE (SEND TO EMAIL)
// =====================================================
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Admin email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // STRICT CHECK: Only allow email addresses configured in process.env (.env)
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return res.status(403).json({ message: "Access denied. Only authorized admin email configured in environment is permitted." });
    }

    let admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      admin = await Admin.create({
        email: cleanEmail,
        name: "System Admin",
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASS || "Admin#2026$7k9P", 10),
      });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await admin.save();

    // Send Email Access Code
    try {
      await sendAdminOtpEmail({
        to: cleanEmail,
        name: admin.name,
        otp,
      });
      console.log(`[ADMIN AUTH] Sent login OTP ${otp} to ${cleanEmail}`);
    } catch (emailErr) {
      console.error("Email send failed for admin OTP:", emailErr);
      return res.status(500).json({ message: `Failed to send email verification code: ${emailErr.message || emailErr}` });
    }

    return res.json({
      ok: true,
      message: `Access verification code sent to ${cleanEmail}`,
    });
  } catch (err) {
    console.error("Request OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
//   2️⃣ VERIFY ADMIN OTP CODE & LOG IN
// =====================================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // STRICT CHECK: Only allow email addresses configured in process.env (.env)
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return res.status(403).json({ message: "Access denied. Only authorized admin email configured in environment is permitted." });
    }

    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin || !admin.otp) {
      return res.status(401).json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > new Date(admin.otpExpires)) {
      admin.otp = null;
      admin.otpExpires = null;
      await admin.save();
      return res.status(401).json({ message: "Verification code expired. Please request a new code." });
    }

    if (admin.otp !== cleanOtp) {
      return res.status(401).json({ message: "Incorrect verification code. Please check your email." });
    }

    // Clear OTP after successful verification
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    // Create JWT
    const token = signAdminToken(admin);

    // Set httpOnly cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return res.json({
      ok: true,
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
//      ADMIN LOGIN (PASSWORD FALLBACK)
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const cleanEmail = email.toLowerCase().trim();

    // STRICT CHECK: Only allow email addresses configured in process.env (.env)
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return res.status(403).json({ message: "Access denied. Only authorized admin email configured in environment is permitted." });
    }

    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin)
      return res.status(401).json({ message: "Invalid credentials" });

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordOk)
      return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT
    const token = signAdminToken(admin);

    // Set httpOnly cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return res.json({
      ok: true,
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
//        LOGOUT
// =======================
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
});

// =======================
//       ADMIN /me
// =======================
router.get("/me", async (req, res) => {
  try {
    let token = null;

    // 1) Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2) Cookie object (Express)
    if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    // 3) Raw Cookie header fallback
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      const found = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      if (found) token = decodeURIComponent(found.split("=")[1]);
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify JWT
    const payload = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findById(payload.id).select("name email");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({
      ok: true,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Admin /me error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
