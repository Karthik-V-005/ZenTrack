const ActivityEvent = require("../models/ActivityEvent");
const UsageFeatureWindow = require("../models/UsageFeatureWindow");

const ONE_HOUR_MS = 60 * 60 * 1000;

function floorToHourUTC(date) {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function minutesBetween(a, b) {
  return (b.getTime() - a.getTime()) / 60000;
}

function getLocalHourFromUTC(dateUTC, tzOffsetMinutes) {
  // tzOffsetMinutes matches JS Date.getTimezoneOffset() semantics (minutes behind UTC)
  // If client sends Date.getTimezoneOffset(), local = UTC - offset.
  const offsetMs = (tzOffsetMinutes || 0) * 60 * 1000;
  const local = new Date(dateUTC.getTime() - offsetMs);
  return local.getHours();
}

function computeSessionStatsFromActivityEvents(events, sessionGapMinutes) {
  // Sessions are inferred from gaps between any activity signal.
  // Activity signals: anything except idle/break start/end.
  const activitySignals = events.filter(
    (e) =>
      !["idle_start", "idle_end", "break_start", "break_end"].includes(
        e.eventType,
      ),
  );

  if (activitySignals.length === 0) {
    return { longest: 0, average: 0 };
  }

  const sorted = activitySignals
    .slice()
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  const sessions = [];
  let sessionStart = new Date(sorted[0].ts);
  let lastTs = new Date(sorted[0].ts);

  for (let i = 1; i < sorted.length; i++) {
    const currentTs = new Date(sorted[i].ts);
    const gapMinutes = minutesBetween(lastTs, currentTs);
    if (gapMinutes > sessionGapMinutes) {
      sessions.push(minutesBetween(sessionStart, lastTs));
      sessionStart = currentTs;
    }
    lastTs = currentTs;
  }

  sessions.push(minutesBetween(sessionStart, lastTs));

  const longest = sessions.length ? Math.max(...sessions) : 0;
  const average = sessions.length
    ? sessions.reduce((sum, v) => sum + v, 0) / sessions.length
    : 0;

  return {
    longest: clamp(longest, 0, 60),
    average: clamp(average, 0, 60),
  };
}

function computeIdleAndBreakMinutes(events, windowStart, windowEnd) {
  // Supports (a) explicit durations, (b) start/end pairing.
  // Counts time inside the window.
  const sorted = events
    .slice()
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  const sumDurations = (typePrefix) => {
    return sorted
      .filter(
        (e) =>
          e.eventType.startsWith(typePrefix) &&
          typeof e.durationMs === "number",
      )
      .reduce((sum, e) => sum + e.durationMs, 0);
  };

  // Duration-style totals (best signal)
  const idleDurationMs = sumDurations("idle");
  const breakDurationMs = sumDurations("break");

  // Start/end inferred totals (fallback)
  const inferIntervalsMs = (startType, endType) => {
    let totalMs = 0;
    let currentStart = null;
    for (const e of sorted) {
      const ts = new Date(e.ts);
      if (e.eventType === startType) {
        currentStart = ts;
      } else if (e.eventType === endType && currentStart) {
        const intervalStart = new Date(
          Math.max(currentStart.getTime(), windowStart.getTime()),
        );
        const intervalEnd = new Date(
          Math.min(ts.getTime(), windowEnd.getTime()),
        );
        if (intervalEnd > intervalStart) {
          totalMs += intervalEnd.getTime() - intervalStart.getTime();
        }
        currentStart = null;
      }
    }
    // If still open, cap at windowEnd
    if (currentStart) {
      const intervalStart = new Date(
        Math.max(currentStart.getTime(), windowStart.getTime()),
      );
      const intervalEnd = windowEnd;
      if (intervalEnd > intervalStart) {
        totalMs += intervalEnd.getTime() - intervalStart.getTime();
      }
    }
    return totalMs;
  };

  const idleInferredMs = inferIntervalsMs("idle_start", "idle_end");
  const breakInferredMs = inferIntervalsMs("break_start", "break_end");

  const idleMs = Math.max(idleDurationMs, idleInferredMs);
  const breakMs = Math.max(breakDurationMs, breakInferredMs);

  return {
    idleMinutes: clamp(idleMs / 60000, 0, 60),
    breakMinutes: clamp(breakMs / 60000, 0, 60),
  };
}

function computeBreakStats(events, breakMinutes) {
  const breakCount = events.filter((e) => e.eventType === "break_start").length;
  const avgBreakLength = breakCount > 0 ? breakMinutes / breakCount : 0;
  return {
    break_count: breakCount,
    avg_break_length: clamp(avgBreakLength, 0, 60),
  };
}

function computeSwitchCounts(events) {
  const appSwitchCount = events.filter(
    (e) => e.eventType === "app_switch",
  ).length;
  const tabSwitchCount = events.filter(
    (e) => e.eventType === "tab_switch",
  ).length;

  const uniqueApps = new Set(
    events
      .filter((e) => ["app_switch", "app_focus"].includes(e.eventType) && e.app)
      .map((e) => e.app),
  ).size;
  const uniqueWebsites = new Set(
    events
      .filter(
        (e) =>
          ["tab_switch", "website_focus"].includes(e.eventType) && e.website,
      )
      .map((e) => e.website),
  ).size;

  return {
    app_switch_count: appSwitchCount,
    tab_switch_count: tabSwitchCount,
    unique_apps: uniqueApps,
    unique_websites: uniqueWebsites,
  };
}

function computeTimeOfDayRatios(
  windowStart,
  totalActiveMinutes,
  tzOffsetMinutes,
) {
  if (!totalActiveMinutes || totalActiveMinutes <= 0) {
    return { late_night_usage_ratio: 0, early_morning_usage_ratio: 0 };
  }

  const hour = getLocalHourFromUTC(windowStart, tzOffsetMinutes);
  const isLateNight = hour >= 0 && hour < 5;
  const isEarlyMorning = hour >= 5 && hour < 9;

  return {
    // For a 1-hour window, ratios are either ~1 or 0.
    late_night_usage_ratio: isLateNight ? 1 : 0,
    early_morning_usage_ratio: isEarlyMorning ? 1 : 0,
  };
}

async function computeWindowFeatures({
  userId,
  windowStart,
  source = "unknown",
  idleTimeoutMinutes = 5,
  sessionGapMinutes = 10,
}) {
  const start = new Date(windowStart);
  const end = new Date(start.getTime() + ONE_HOUR_MS);

  const events = await ActivityEvent.find({
    userId,
    source,
    ts: { $gte: start, $lt: end },
  })
    .lean()
    .exec();

  const tzOffsetMinutes =
    [...events].reverse().find((e) => typeof e.tzOffsetMinutes === "number")
      ?.tzOffsetMinutes ?? 0;

  const { idleMinutes, breakMinutes } = computeIdleAndBreakMinutes(
    events,
    start,
    end,
  );
  const totalActiveMinutes = clamp(60 - idleMinutes, 0, 60);
  const idleRatio = clamp(idleMinutes / 60, 0, 1);

  const sessionStats = computeSessionStatsFromActivityEvents(
    events,
    sessionGapMinutes,
  );
  const switchStats = computeSwitchCounts(events);
  const breakStats = computeBreakStats(events, breakMinutes);
  const timeOfDay = computeTimeOfDayRatios(
    start,
    totalActiveMinutes,
    tzOffsetMinutes,
  );

  const contextSwitchRate =
    totalActiveMinutes > 0
      ? (switchStats.app_switch_count + switchStats.tab_switch_count) /
        totalActiveMinutes
      : 0;

  // Note: break_minutes is intentionally not part of the requested feature list.
  return {
    userId,
    windowStart: start,
    windowEnd: end,
    source,
    total_active_minutes: totalActiveMinutes,
    longest_continuous_session: sessionStats.longest,
    avg_session_length: sessionStats.average,
    app_switch_count: switchStats.app_switch_count,
    tab_switch_count: switchStats.tab_switch_count,
    context_switch_rate: clamp(contextSwitchRate, 0, 9999),
    unique_apps: switchStats.unique_apps,
    unique_websites: switchStats.unique_websites,
    late_night_usage_ratio: timeOfDay.late_night_usage_ratio,
    early_morning_usage_ratio: timeOfDay.early_morning_usage_ratio,
    idle_minutes: idleMinutes,
    idle_ratio: idleRatio,
    break_count: breakStats.break_count,
    avg_break_length: breakStats.avg_break_length,
    computedAt: new Date(),
  };
}

async function upsertWindowFeatures(featureDoc) {
  const { userId, windowStart, source } = featureDoc;
  return UsageFeatureWindow.findOneAndUpdate(
    { userId, windowStart, source },
    { $set: featureDoc },
    { upsert: true, new: true },
  )
    .lean()
    .exec();
}

module.exports = {
  floorToHourUTC,
  computeWindowFeatures,
  upsertWindowFeatures,
};
