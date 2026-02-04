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

// ✅ MIDDLEWARE
app.use(cors());
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
  corsOrigin: process.env.CORS_ORIGIN || "*",
});
app.set("io", io);

// 🔹 Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
