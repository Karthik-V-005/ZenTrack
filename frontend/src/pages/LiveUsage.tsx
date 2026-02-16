import React, { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Timer,
  BarChart3,
  Monitor,
  Globe,
  Layout,
  MousePointer2,
  Moon,
  Coffee,
  Clock,
  Shield,
} from "lucide-react";
import { useZenStore } from "../store/useStore";

export const LiveUsage = () => {
  const { liveMetrics, setLiveMetrics } = useZenStore();

  /* =========================
     SEVERITY CONFIG (PRIMARY)
  ========================= */
  const severityConfig = {
    low: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      label: "Low Fatigue",
      suggestion: "Fatigue levels are within a safe range.",
    },
    medium: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.18)]",
      label: "Moderate Fatigue",
      suggestion: "Fatigue is building up. A short break is recommended.",
    },
    high: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-[0_0_40px_rgba(244,63,94,0.25)]",
      label: "High Fatigue",
      suggestion: "Critical fatigue detected. Stop usage and rest immediately.",
    },
  };

  const currentSeverity =
    (liveMetrics.severity?.toLowerCase() as keyof typeof severityConfig) ||
    "low";
  const sev = severityConfig[currentSeverity];

  /* =========================
     SIMULATED LIVE STREAM
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => {
        const fatigue = Math.min(
          100,
          Math.max(0, (prev.fatigue_score || 0) + (Math.random() * 4 - 1))
        );

        let severity: "low" | "medium" | "high" = "low";
        if (fatigue > 70) severity = "high";
        else if (fatigue > 40) severity = "medium";

        return {
          ...prev,
          fatigue_score: fatigue,
          severity,
          total_active_minutes: prev.total_active_minutes + 1,
          app_switch_count: prev.app_switch_count + (Math.random() > 0.9 ? 1 : 0),
          tab_switch_count: prev.tab_switch_count + (Math.random() > 0.85 ? 1 : 0),
          context_switch_rate: Math.min(
            1,
            Math.max(0, prev.context_switch_rate + (Math.random() - 0.5) * 0.02)
          ),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [setLiveMetrics]);

  /* =========================
     SUPPORTING CALCULATION
  ========================= */
  const usageConsistency = useMemo(() => {
    return Math.round((1 - (liveMetrics.context_switch_rate || 0)) * 100);
  }, [liveMetrics.context_switch_rate]);

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Live Fatigue Monitor</h1>
        </div>
        <p className="text-slate-500 text-lg">
          Fatigue estimation based on continuous device usage behaviour.
        </p>
      </header>

      {/* =========================
         PRIMARY: FATIGUE + SEVERITY
      ========================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className={`lg:col-span-2 bg-[#141417] border ${sev.border} ${sev.glow} rounded-[2.5rem] p-10`}
        >
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${sev.color}`}>
                Current Fatigue State
              </p>
              <h2 className="text-4xl font-bold text-white mt-3">
                {sev.label}
              </h2>
              <p className="text-slate-400 text-lg mt-4 max-w-md">
                {sev.suggestion}
              </p>
            </div>

            <div className="text-right">
              <p className="text-slate-500 text-sm font-medium mb-2">
                Fatigue Score
              </p>
              <div className="flex items-baseline justify-end gap-2">
                <AnimatedValue
                  value={Math.round(liveMetrics.fatigue_score || 0)}
                  className={`text-7xl font-bold tracking-tighter ${sev.color}`}
                />
                <span className="text-2xl font-bold text-slate-500">%</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${liveMetrics.fatigue_score}%` }}
                className={`h-full ${
                  currentSeverity === "high"
                    ? "bg-rose-500"
                    : currentSeverity === "medium"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* CONTINUOUS USAGE */}
        <Card
          icon={Clock}
          title="Longest Continuous Usage"
          value={liveMetrics.longest_continuous_session}
          unit="s"
          caption="Prolonged device exposure"
        />
      </section>

      {/* =========================
         SECONDARY: FATIGUE FACTORS
      ========================= */}
      <section>
        <h2 className="section-title">
          Usage Factors Contributing to Fatigue
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            icon={Timer}
            title="Device Exposure Time"
            value={liveMetrics.total_active_minutes}
            unit="min"
            caption="Total interaction duration"
          />

          <Card
            icon={BarChart3}
            title="Average Usage Session"
            value={liveMetrics.avg_session_length}
            unit="s"
            caption="Typical continuous usage"
          />

          <motion.div className="bg-[#111114] border border-slate-800/50 rounded-3xl p-8">
            <Shield className="w-6 h-6 text-slate-400 mb-6" />
            <p className="text-slate-500 text-sm">Usage Consistency</p>
            <p className="text-4xl font-bold text-white">
              {usageConsistency}%
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Derived from context switching behaviour
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================
         ACTIVITY CONTRIBUTION
      ========================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="section-title">Activity Contribution</h2>
          <div className="grid grid-cols-2 gap-6">
            <Compact
              icon={Layout}
              title="Applications Used"
              value={liveMetrics.unique_apps}
              caption="Cognitive load contributors"
            />
            <Compact
              icon={MousePointer2}
              title="Websites Visited"
              value={liveMetrics.unique_websites}
              caption="Navigation strain sources"
            />
          </div>
        </div>

        <div>
          <h2 className="section-title">Recovery Indicators</h2>
          <div className="grid grid-cols-3 gap-4">
            <Compact
              icon={Moon}
              title="Late Night Usage"
              value={`${Math.round(
                (liveMetrics.late_night_usage_ratio || 0) * 100
              )}%`}
              caption="Fatigue risk factor"
            />
            <Compact
              icon={Coffee}
              title="Breaks Taken"
              value={liveMetrics.break_count}
              caption="Recovery attempts"
            />
            <Compact
              icon={Clock}
              title="Avg Break Length"
              value={`${liveMetrics.avg_break_length}s`}
              caption="Recovery duration"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

/* =========================
   SMALL COMPONENTS
========================= */

const sectionTitle =
  "text-sm font-bold uppercase tracking-[0.2em] text-slate-600 mb-6";
const AnimatedValue = ({ value, className }: any) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className={className}
  >
    {value}
  </motion.span>
);

const Card = ({ icon: Icon, title, value, unit, caption }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-[#111114] border border-slate-800/50 rounded-3xl p-8"
  >
    <Icon className="w-6 h-6 text-slate-400 mb-6" />
    <p className="text-slate-500 text-sm">{title}</p>
    <p className="text-4xl font-bold text-white">
      {value}
      {unit && <span className="text-slate-500 text-xl ml-1">{unit}</span>}
    </p>
    <p className="text-xs text-slate-400 mt-2">{caption}</p>
  </motion.div>
);

const Compact = ({ icon: Icon, title, value, caption }: any) => (
  <div className="bg-[#111114]/60 border border-slate-800/50 rounded-2xl p-5">
    <Icon className="w-4 h-4 text-slate-400 mb-3" />
    <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-[10px] text-slate-600">{caption}</p>
  </div>
);
