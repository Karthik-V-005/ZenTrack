const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  postEvents,
  aggregateRange,
  getCurrentWindow,
} = require("../controllers/activityController");

const router = express.Router();

// Receive raw, privacy-safe activity events
router.post("/events", authMiddleware, postEvents);

// Aggregate a date range into 1-hour windows
router.post("/aggregate", authMiddleware, aggregateRange);

// Fetch current hour window (and compute if missing)
router.get("/features/current", authMiddleware, getCurrentWindow);

module.exports = router;
