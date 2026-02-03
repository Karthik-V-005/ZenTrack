const mongoose = require("mongoose");

const UsageFeatureWindowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    windowStart: { type: Date, required: true, index: true },
    windowEnd: { type: Date, required: true },
    source: {
      type: String,
      enum: ["web", "desktop", "mobile", "unknown"],
      default: "unknown",
      index: true,
    },

    // Feature parameters (per 1-hour window)
    total_active_minutes: { type: Number, default: 0 },
    longest_continuous_session: { type: Number, default: 0 },
    avg_session_length: { type: Number, default: 0 },
    app_switch_count: { type: Number, default: 0 },
    tab_switch_count: { type: Number, default: 0 },
    context_switch_rate: { type: Number, default: 0 },
    unique_apps: { type: Number, default: 0 },
    unique_websites: { type: Number, default: 0 },
    late_night_usage_ratio: { type: Number, default: 0 },
    early_morning_usage_ratio: { type: Number, default: 0 },
    idle_minutes: { type: Number, default: 0 },
    idle_ratio: { type: Number, default: 0 },
    break_count: { type: Number, default: 0 },
    avg_break_length: { type: Number, default: 0 },

    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UsageFeatureWindowSchema.index(
  { userId: 1, windowStart: 1, source: 1 },
  { unique: true },
);

module.exports = mongoose.model("UsageFeatureWindow", UsageFeatureWindowSchema);
