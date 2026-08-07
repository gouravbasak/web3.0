const jwt = require("jsonwebtoken");

module.exports = function userAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 Your JWT contains { userId }
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};