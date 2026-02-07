const DEFAULT_TIMEOUT_MS = 1200;

function getMlBaseUrl() {
  return process.env.ML_SERVICE_URL || "http://localhost:8001";
}

function buildFeatureVectorFromWindow(windowDoc) {
  return [
    windowDoc.total_active_minutes ?? 0,
    windowDoc.longest_continuous_session ?? 0,
    windowDoc.avg_session_length ?? 0,
    windowDoc.app_switch_count ?? 0,
    windowDoc.tab_switch_count ?? 0,
    windowDoc.context_switch_rate ?? 0,
    windowDoc.unique_apps ?? 0,
    windowDoc.unique_websites ?? 0,
    windowDoc.late_night_usage_ratio ?? 0,
    windowDoc.early_morning_usage_ratio ?? 0,
    windowDoc.idle_minutes ?? 0,
    windowDoc.idle_ratio ?? 0,
    windowDoc.break_count ?? 0,
    windowDoc.avg_break_length ?? 0,
  ];
}

async function predictFatigueScore(
  features,
  { timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const baseUrl = getMlBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/predict`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (typeof fetch !== "function") {
      throw new Error(
        "Global fetch() is not available. Use Node 18+ or add a fetch polyfill.",
      );
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `ML service error ${res.status}: ${text || res.statusText}`,
      );
    }

    const data = await res.json();
    const fatigueScore = Number(data?.fatigue_score);
    const severity = data?.severity;

    if (!Number.isFinite(fatigueScore) || typeof severity !== "string") {
      throw new Error("Invalid ML response format");
    }

    return {
      fatigue_score: Math.max(0, Math.min(100, fatigueScore)),
      severity,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  buildFeatureVectorFromWindow,
  predictFatigueScore,
};
