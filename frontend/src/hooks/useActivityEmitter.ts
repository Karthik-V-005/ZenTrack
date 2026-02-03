import { useEffect, useMemo, useRef } from "react";

type ActivityEventType =
  | "activity_ping"
  | "idle_start"
  | "idle_end"
  | "tab_switch"
  | "website_focus";

type ActivityEvent = {
  ts: string;
  source: "web";
  eventType: ActivityEventType;
  website?: string;
  durationMs?: number;
  tzOffsetMinutes?: number;
};

function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
}

export function useActivityEmitter(options?: {
  enabled?: boolean;
  pingIntervalMs?: number;
  idleAfterMs?: number;
}) {
  const enabled = options?.enabled ?? true;
  const pingIntervalMs = options?.pingIntervalMs ?? 15_000;
  const idleAfterMs = options?.idleAfterMs ?? 5 * 60_000;

  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const queueRef = useRef<ActivityEvent[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const idleStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const tzOffsetMinutes = new Date().getTimezoneOffset();
    const website = window.location.hostname;

    const enqueue = (
      event: Omit<ActivityEvent, "ts" | "source" | "tzOffsetMinutes"> & {
        durationMs?: number;
      },
    ) => {
      queueRef.current.push({
        ts: new Date().toISOString(),
        source: "web",
        tzOffsetMinutes,
        website,
        ...event,
      });
    };

    const flush = async () => {
      const batch = queueRef.current.splice(0, queueRef.current.length);
      if (batch.length === 0) return;

      try {
        await fetch(`${baseUrl}/api/activity/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ events: batch }),
        });
      } catch {
        // If offline or server down, drop events (privacy-safe & minimal).
      }
    };

    const scheduleFlush = () => {
      if (flushTimerRef.current != null) return;
      flushTimerRef.current = window.setTimeout(async () => {
        flushTimerRef.current = null;
        await flush();
      }, 1500);
    };

    const markInteraction = () => {
      lastInteractionRef.current = Date.now();

      // If coming back from idle, close idle interval.
      if (idleStartRef.current != null) {
        const durationMs = Date.now() - idleStartRef.current;
        idleStartRef.current = null;
        enqueue({ eventType: "idle_end", durationMs });
        scheduleFlush();
      }
    };

    // Initial focus signal
    enqueue({ eventType: "website_focus" });
    scheduleFlush();

    const onVisibilityChange = () => {
      // Count a tab/context switch whenever visibility changes.
      enqueue({ eventType: "tab_switch" });
      scheduleFlush();
      markInteraction();
    };

    // Only metadata: do NOT capture keystrokes. (No keydown listener.)
    window.addEventListener("mousemove", markInteraction, { passive: true });
    window.addEventListener("click", markInteraction, { passive: true });
    window.addEventListener("scroll", markInteraction, { passive: true });
    window.addEventListener("touchstart", markInteraction, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Activity pings while user is active
    pingTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      const isIdle = idleStartRef.current != null;
      if (!isIdle && now - lastInteractionRef.current < idleAfterMs) {
        enqueue({ eventType: "activity_ping" });
        scheduleFlush();
      }
    }, pingIntervalMs);

    // Idle detection
    idleTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      const idleFor = now - lastInteractionRef.current;
      if (idleStartRef.current == null && idleFor >= idleAfterMs) {
        idleStartRef.current = now;
        enqueue({ eventType: "idle_start" });
        scheduleFlush();
      }
    }, 2000);

    return () => {
      window.removeEventListener("mousemove", markInteraction);
      window.removeEventListener("click", markInteraction);
      window.removeEventListener("scroll", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (pingTimerRef.current != null) {
        window.clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      if (idleTimerRef.current != null) {
        window.clearInterval(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (flushTimerRef.current != null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }

      // best-effort final flush
      void flush();
    };
  }, [baseUrl, enabled, idleAfterMs, pingIntervalMs]);
}
