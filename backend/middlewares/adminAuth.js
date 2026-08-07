const jwt = require("jsonwebtoken");

module.exports = function adminAuth(req, res, next) {
  const token =
    req.cookies?.adminToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) return res.status(401).json({ message: "Admin not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden — Admin only" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};
