import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Download, Info } from "lucide-react";
import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";

const weeklyData = [
  { day: "Mon", usage: 6.5, fatigue: 45 },
  { day: "Tue", usage: 7.2, fatigue: 52 },
  { day: "Wed", usage: 8.0, fatigue: 68 },
  { day: "Thu", usage: 6.8, fatigue: 58 },
  { day: "Fri", usage: 5.5, fatigue: 40 },
  { day: "Sat", usage: 3.2, fatigue: 25 },
  { day: "Sun", usage: 2.8, fatigue: 15 },
];

const categoryData = [
  { name: "Productivity", value: 45, color: "#6366f1" },
  { name: "Entertainment", value: 30, color: "#818cf8" },
  { name: "Social", value: 15, color: "#a5b4fc" },
  { name: "Utilities", value: 10, color: "#c7d2fe" },
];

export const Analytics = () => {
  const baseUrl = useMemo(() => {
    const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
    if (envUrl) return envUrl.replace(/\/+$/, "");
    const isProd = Boolean((import.meta as any).env?.PROD);
    return isProd
      ? "https://zentrack-w3xl.onrender.com"
      : "http://localhost:5000";
  }, []);

  const [liveFatigueScore, setLiveFatigueScore] = useState<number | null>(null);
  const [liveSeverity, setLiveSeverity] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let isCancelled = false;

    async function fetchSnapshot() {
      try {
        const res = await fetch(`${baseUrl}/api/activity/features/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const w = data?.window;
        if (isCancelled || !w) return;
        if (typeof w.fatigue_score === "number")
          setLiveFatigueScore(w.fatigue_score);
        if (typeof w.severity === "string") setLiveSeverity(w.severity);
      } catch {
        // ignore
      }
    }

    fetchSnapshot();

    const socket = io(baseUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("usage:metrics", (payload: any) => {
      if (isCancelled || !payload) return;
      if (typeof payload.fatigue_score === "number")
        setLiveFatigueScore(payload.fatigue_score);
      if (typeof payload.severity === "string")
        setLiveSeverity(payload.severity);
    });

    return () => {
      isCancelled = true;
      socket.disconnect();
    };
  }, [baseUrl]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Deep Analytics</h1>
          <p className="text-slate-500">Long-term trends and usage patterns.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/50 flex items-center gap-2 transition-all">
            <Calendar className="w-4 h-4" />
            <span>Last 7 Days</span>
          </button>
          <button className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111114] border border-slate-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white">
              Usage vs. Fatigue
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-xs text-slate-400">Fatigue Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <span className="text-xs text-slate-400">Usage (Hours)</span>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#111114",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="fatigue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111114] border border-slate-800/50 rounded-3xl p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-8">
            Distribution
          </h3>
          <div className="h-[200px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {categoryData.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-slate-400">{cat.name}</span>
                </div>
                <span className="text-white font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Info className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Fatigue Insight</h3>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Your fatigue scores peak every Wednesday around 3:00 PM. This
            correlates with your back-to-back meeting schedule. We recommend
            scheduling a 15-minute buffer between 2:00 PM and 3:00 PM.
          </p>

          <div className="mt-5 rounded-2xl border border-indigo-500/10 bg-black/20 px-4 py-3">
            <div className="text-xs text-slate-400">Live (current window)</div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <div className="text-2xl font-bold text-white">
                {typeof liveFatigueScore === "number"
                  ? Math.round(liveFatigueScore)
                  : "—"}
                <span className="ml-2 text-sm font-medium text-slate-400">
                  / 100
                </span>
              </div>
              <div className="text-sm font-semibold text-indigo-300">
                {liveSeverity ?? "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Efficiency metrics
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-400">Digital Balance</span>
                <span className="text-sm text-indigo-400 font-bold">84%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[84%] h-full bg-indigo-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-400">
                  Sleep Quality Correlation
                </span>
                <span className="text-sm text-emerald-400 font-bold">Good</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[72%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
