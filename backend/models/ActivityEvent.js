const mongoose = require("mongoose");

const ActivityEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ts: { type: Date, required: true, index: true },
    source: {
      type: String,
      enum: ["web", "desktop", "mobile", "unknown"],
      default: "unknown",
      index: true,
    },

    // Privacy-safe metadata only. No keystrokes, no screenshots.
    eventType: {
      type: String,
      enum: [
        "activity_ping",
        "idle_start",
        "idle_end",
        "break_start",
        "break_end",
        "app_switch",
        "tab_switch",
        "website_focus",
        "app_focus",
      ],
      required: true,
      index: true,
    },

    // Optional identifiers (recommended to send hashed identifiers from clients).
    app: { type: String, trim: true, maxlength: 256 },
    website: { type: String, trim: true, maxlength: 256 },

    // Optional duration for interval-like events (idle/break), in milliseconds.
    durationMs: { type: Number, min: 0 },

    // Optional client timezone offset in minutes (e.g. IST = -330, PST = 480).
    tzOffsetMinutes: { type: Number, min: -840, max: 840 },
  },
  { timestamps: true },
);

ActivityEventSchema.index({ userId: 1, ts: 1 });

module.exports = mongoose.model("ActivityEvent", ActivityEventSchema);
