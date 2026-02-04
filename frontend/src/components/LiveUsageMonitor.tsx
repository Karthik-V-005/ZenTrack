import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type UsageWindow = {
  windowStart: string;
  windowEnd: string;
  source: "web" | "desktop" | "mobile" | "unknown";
  total_active_minutes: number;
  longest_continuous_session: number;
  avg_session_length: number;
  app_switch_count: number;
  tab_switch_count: number;
  context_switch_rate: number;
  unique_apps: number;
  unique_websites: number;
  late_night_usage_ratio: number;
  early_morning_usage_ratio: number;
  idle_minutes: number;
  idle_ratio: number;
  break_count: number;
  avg_break_length: number;
  computedAt?: string;
};

const DEFAULT_WINDOW: UsageWindow = {
  windowStart: new Date().toISOString(),
  windowEnd: new Date().toISOString(),
  source: "unknown",
  total_active_minutes: 0,
  longest_continuous_session: 0,
  avg_session_length: 0,
  app_switch_count: 0,
  tab_switch_count: 0,
  context_switch_rate: 0,
  unique_apps: 0,
  unique_websites: 0,
  late_night_usage_ratio: 0,
  early_morning_usage_ratio: 0,
  idle_minutes: 0,
  idle_ratio: 0,
  break_count: 0,
  avg_break_length: 0,
};

function formatNumber(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(digits).replace(/\.00$/, "");
}

function formatRatio(r: number) {
  const pct = Math.max(0, Math.min(1, r)) * 100;
  return `${formatNumber(pct, 0)}%`;
}

export default function LiveUsageMonitor(props: {
  source?: UsageWindow["source"];
}) {
  const source = props.source ?? "unknown";
  const baseUrl = useMemo(() => {
    return (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
  }, []);

  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [window, setWindow] = useState<UsageWindow>(DEFAULT_WINDOW);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated (missing token).");
      setStatus("disconnected");
      return;
    }

    let isCancelled = false;

    async function fetchSnapshot() {
      try {
        const res = await fetch(
          `${baseUrl}/api/activity/features/current?source=${encodeURIComponent(source)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && data?.window) {
          setWindow((prev) => ({ ...prev, ...data.window }));
        }
      } catch {
        // ignore snapshot errors; socket updates still work
      }
    }

    fetchSnapshot();

    setStatus("connecting");
    setError(null);

    const socket = io(baseUrl, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (isCancelled) return;
      setStatus("connected");
      setError(null);
    });

    socket.on("disconnect", () => {
      if (isCancelled) return;
      setStatus("disconnected");
    });

    socket.on("connect_error", (err: unknown) => {
      if (isCancelled) return;
      setStatus("disconnected");
      setError(err instanceof Error ? err.message : "Socket connection error");
    });

    socket.on("usage:metrics", (payload: Partial<UsageWindow>) => {
      if (isCancelled) return;
      if (!payload) return;
      if (payload.source && payload.source !== source) return;
      setWindow((prev) => ({ ...prev, ...payload }) as UsageWindow);
    });

    return () => {
      isCancelled = true;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [baseUrl, source]);

  const rows: Array<{ key: keyof UsageWindow; label: string; value: string }> =
    [
      {
        key: "total_active_minutes",
        label: "total_active_minutes",
        value: formatNumber(window.total_active_minutes, 1),
      },
      {
        key: "longest_continuous_session",
        label: "longest_continuous_session",
        value: formatNumber(window.longest_continuous_session, 1),
      },
      {
        key: "avg_session_length",
        label: "avg_session_length",
        value: formatNumber(window.avg_session_length, 1),
      },
      {
        key: "app_switch_count",
        label: "app_switch_count",
        value: String(window.app_switch_count ?? 0),
      },
      {
        key: "tab_switch_count",
        label: "tab_switch_count",
        value: String(window.tab_switch_count ?? 0),
      },
      {
        key: "context_switch_rate",
        label: "context_switch_rate",
        value: formatNumber(window.context_switch_rate, 2),
      },
      {
        key: "unique_apps",
        label: "unique_apps",
        value: String(window.unique_apps ?? 0),
      },
      {
        key: "unique_websites",
        label: "unique_websites",
        value: String(window.unique_websites ?? 0),
      },
      {
        key: "late_night_usage_ratio",
        label: "late_night_usage_ratio",
        value: formatRatio(window.late_night_usage_ratio),
      },
      {
        key: "early_morning_usage_ratio",
        label: "early_morning_usage_ratio",
        value: formatRatio(window.early_morning_usage_ratio),
      },
      {
        key: "idle_minutes",
        label: "idle_minutes",
        value: formatNumber(window.idle_minutes, 1),
      },
      {
        key: "idle_ratio",
        label: "idle_ratio",
        value: formatRatio(window.idle_ratio),
      },
      {
        key: "break_count",
        label: "break_count",
        value: String(window.break_count ?? 0),
      },
      {
        key: "avg_break_length",
        label: "avg_break_length",
        value: formatNumber(window.avg_break_length, 1),
      },
    ];

  return (
    <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Live Usage Monitor</div>
          <div className="text-xs text-white/70">
            Source: <span className="font-mono">{source}</span> • Window:{" "}
            <span className="font-mono">
              {new Date(window.windowStart).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-xs">
          <span
            className={
              status === "connected"
                ? "text-emerald-300"
                : status === "connecting"
                  ? "text-amber-300"
                  : "text-rose-300"
            }
          >
            {status}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-lg border border-white/10 bg-black/20 p-3"
          >
            <div className="text-xs text-white/70">{r.label}</div>
            <div className="mt-1 text-xl font-semibold">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
