const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: false },
  name: { type: String, default: "Admin" },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
