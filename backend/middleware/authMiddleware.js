const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Header-la token eduthurom
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Token verify pannrom
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ User info request-kulla set pannrom
    req.user = decoded;

    // 4️⃣ Next route-ku pogalam
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
