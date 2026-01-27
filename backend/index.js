const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// JSON read panna
app.use(express.json());

// 🔹 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// 🔹 USAGE API
app.post("/api/usage", (req, res) => {
  console.log("Received:", req.body);

  res.json({
    message: "Usage data received",
    data: req.body
  });
});

// 🔹 MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// 🔹 Server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
