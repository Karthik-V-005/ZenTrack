const ActivityEvent = require("../models/ActivityEvent");
const UsageFeatureWindow = require("../models/UsageFeatureWindow");
const {
  floorToHourUTC,
  computeWindowFeatures,
  upsertWindowFeatures,
} = require("../services/featureAggregator");

function normalizeEvent(input) {
  const ts = input.ts ? new Date(input.ts) : new Date();
  if (Number.isNaN(ts.getTime())) {
    throw new Error("Invalid event ts");
  }

  const source = input.source || "unknown";
  const eventType = input.eventType;
  if (!eventType) {
    throw new Error("Missing eventType");
  }

  const event = {
    ts,
    source,
    eventType,
    app: typeof input.app === "string" ? input.app : undefined,
    website: typeof input.website === "string" ? input.website : undefined,
    durationMs:
      typeof input.durationMs === "number" && input.durationMs >= 0
        ? input.durationMs
        : undefined,
    tzOffsetMinutes:
      typeof input.tzOffsetMinutes === "number"
        ? input.tzOffsetMinutes
        : undefined,
  };

  return event;
}

async function postEvents(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = req.body;
    const inputs = Array.isArray(payload) ? payload : payload?.events;
    const eventsIn = Array.isArray(inputs) ? inputs : [payload];

    const normalized = eventsIn
      .filter(Boolean)
      .map((e) => normalizeEvent(e))
      .map((e) => ({ ...e, userId }));

    if (normalized.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No events provided" });
    }

    await ActivityEvent.insertMany(normalized, { ordered: false });

    // Compute + upsert current hour window for the last event's source.
    const last = normalized[normalized.length - 1];
    const windowStart = floorToHourUTC(last.ts);
    const featureDoc = await computeWindowFeatures({
      userId,
      windowStart,
      source: last.source,
    });
    const upserted = await upsertWindowFeatures(featureDoc);

    // Emit live metrics to this user via socket if available.
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${userId}`).emit("usage:metrics", upserted);
    }

    return res.status(200).json({
      success: true,
      message: "Events ingested",
      window: upserted,
    });
  } catch (err) {
    console.error("postEvents error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function aggregateRange(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      from,
      to,
      source = "unknown",
      forceRecompute = false,
    } = req.body || {};
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (
      !fromDate ||
      !toDate ||
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "from and to (valid dates) are required",
      });
    }

    const startHour = floorToHourUTC(fromDate);
    const endHour = floorToHourUTC(toDate);

    const hours =
      Math.floor((endHour.getTime() - startHour.getTime()) / (60 * 60 * 1000)) +
      1;
    if (hours <= 0) {
      return res.status(400).json({ success: false, message: "Invalid range" });
    }
    if (hours > 168) {
      return res.status(400).json({
        success: false,
        message: "Range too large (max 168 hours)",
      });
    }

    const results = [];
    for (let i = 0; i < hours; i++) {
      const windowStart = new Date(startHour.getTime() + i * 60 * 60 * 1000);

      if (!forceRecompute) {
        const existing = await UsageFeatureWindow.findOne({
          userId,
          windowStart,
          source,
        })
          .lean()
          .exec();
        if (existing) {
          results.push(existing);
          continue;
        }
      }

      const featureDoc = await computeWindowFeatures({
        userId,
        windowStart,
        source,
      });
      const upserted = await upsertWindowFeatures(featureDoc);
      results.push(upserted);
    }

    return res.status(200).json({ success: true, windows: results });
  } catch (err) {
    console.error("aggregateRange error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getCurrentWindow(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const source = req.query?.source || "unknown";
    const windowStart = floorToHourUTC(new Date());

    const existing = await UsageFeatureWindow.findOne({
      userId,
      windowStart,
      source,
    })
      .lean()
      .exec();
    if (existing) {
      return res.status(200).json({ success: true, window: existing });
    }

    const featureDoc = await computeWindowFeatures({
      userId,
      windowStart,
      source,
    });
    const upserted = await upsertWindowFeatures(featureDoc);
    return res.status(200).json({ success: true, window: upserted });
  } catch (err) {
    console.error("getCurrentWindow error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  postEvents,
  aggregateRange,
  getCurrentWindow,
};
