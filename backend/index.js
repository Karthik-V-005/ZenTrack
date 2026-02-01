const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Usage = require("./models/Usage");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔹 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// 🔹 AUTH ROUTES
app.use("/api/auth", authRoutes);

// 🔹 USAGE API
app.post("/api/usage", (req, res) => {
  res.json({
    message: "Usage data received",
    data: req.body
  });
});

// 🔹 MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

// 🔹 Server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
