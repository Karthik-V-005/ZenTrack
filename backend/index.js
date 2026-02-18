const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Usage = require("./models/Usage");
const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const initSocket = require("./sockets/initSocket");

const app = express();
const server = http.createServer(app);

const DEFAULT_FRONTEND_ORIGINS = [
  "https://zentrack-lilac.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const stripTrailingSlashes = (value) =>
  typeof value === "string" ? value.replace(/\/+$/, "") : value;

const allowedOrigins = (
  process.env.CORS_ORIGIN || DEFAULT_FRONTEND_ORIGINS.join(",")
)
  .split(",")
  .map((v) => stripTrailingSlashes(v.trim()))
  .filter(Boolean);

// ✅ MIDDLEWARE
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = stripTrailingSlashes(origin);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// 🔹 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// 🔹 AUTH ROUTES
app.use("/api/auth", authRoutes);

// 🔹 ACTIVITY / REAL-TIME USAGE ROUTES
app.use("/api/activity", activityRoutes);

// 🔹 USAGE API
app.post("/api/usage", (req, res) => {
  res.json({
    message: "Usage data received",
    data: req.body,
  });
});

// 🔹 MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

// 🔹 Socket.IO (JWT-protected)
const io = initSocket(server, {
  corsOrigin: allowedOrigins.length ? allowedOrigins : "*",
});
app.set("io", io);

// 🔹 Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
