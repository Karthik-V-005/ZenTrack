const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Usage = require("./models/Usage"); 
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
// ✅ GET usage per user per day
app.get("/api/usage/day", async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({
        message: "userId and date are required"
      });
    }

    // start & end of the given day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const usageData = await Usage.find({
      userId: userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    res.json({
      count: usageData.length,
      data: usageData
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching usage data",
      error: error.message
    });
  }
});

// ✅ GET daily usage summary (aggregation)
app.get("/api/usage/summary", async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({
        message: "userId and date are required"
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const usageData = await Usage.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
// 🔢 Calculate values FIRST
let totalScreenTime = 0;
let sessions = usageData.length;
let lateNightUsage = false;

usageData.forEach(item => {
  totalScreenTime += item.screenTime;
  if (item.lateNight) lateNightUsage = true;
});

    
    // 🧠 Fatigue Score Logic
let fatigueScore = 0;

if (totalScreenTime > 6) fatigueScore += 3;
if (sessions > 10) fatigueScore += 2;
if (lateNightUsage) fatigueScore += 3;

// Fatigue Level
let fatigueLevel = "Normal";
if (fatigueScore >= 4 && fatigueScore <= 6) {
  fatigueLevel = "Mild Fatigue";
} else if (fatigueScore >= 7) {
  fatigueLevel = "High Fatigue";
}


  res.json({
  userId,
  date,
  totalScreenTime,
  sessions,
  lateNightUsage,
  fatigueScore,
  fatigueLevel
});


  } catch (error) {
    res.status(500).json({
      message: "Error generating summary",
      error: error.message
    });
  }
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

