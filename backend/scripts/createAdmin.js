require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

const MONGO = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!MONGO || !ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Please set MONGO_URI, ADMIN_EMAIL and ADMIN_PASS in .env");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(ADMIN_PASS, salt);
  
  let admin = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
  if (admin) {
    admin.passwordHash = hash;
    await admin.save();
    console.log("✅ Admin password updated for:", ADMIN_EMAIL);
  } else {
    admin = new Admin({ email: ADMIN_EMAIL.toLowerCase().trim(), passwordHash: hash, name: "Admin" });
    await admin.save();
    console.log("✅ Admin account created for:", ADMIN_EMAIL);
  }
  process.exit(0);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
