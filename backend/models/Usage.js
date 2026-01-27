const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      required: true
    },
    screenTime: {
      type: Number,
      required: true
    },
    lateNight: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Usage", usageSchema);
