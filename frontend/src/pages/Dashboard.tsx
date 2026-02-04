import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Battery,
  Wind,
  Smartphone,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useZenStore } from '../store/useStore';
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: '8am', score: 30 },
  { name: '10am', score: 45 },
  { name: '12pm', score: 60 },
  { name: '2pm', score: 75 },
  { name: '4pm', score: 85 },
  { name: '6pm', score: 70 },
  { name: '8pm', score: 50 },
  { name: '10pm', score: 40 },
];

export const Dashboard = () => {
  const { fatigueScore, user } = useZenStore();

  const getStatusColor = (score: number) => {
    if (score < 40) return 'text-emerald-400';
    if (score < 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusBg = (score: number) => {
    if (score < 40) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score < 70) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="h-full flex flex-col p-4 text-white">
      {/* Header (fixed) */}
      <header className="flex-none flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Good afternoon, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-500 text-sm">
            Here's your digital wellbeing status for today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-1 rounded-xl">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">Jan 31, 2026 • 2:45 PM</span>
        </div>
      </header>

      {/* Content area: internal scroll only */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 bg-[#111114] rounded-3xl p-6 border border-slate-800/50 overflow-visible">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-indigo-400" />
              <h3 className="text-lg font-semibold">Current Fatigue Score</h3>
            </div>

            <div className="flex items-end gap-3 mb-3">
              <span className={`text-5xl md:text-6xl font-bold ${getStatusColor(fatigueScore)}`}>
                {fatigueScore}
              </span>
              <span className="text-slate-500">/100</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${getStatusBg(fatigueScore)}`}>
              {fatigueScore < 40 ? 'Optimal focus' : fatigueScore < 70 ? 'Moderate fatigue' : 'High fatigue'}
            </div>

            <div className="h-[160px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  <Tooltip contentStyle={{ backgroundColor: '#111114', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#818cf8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <span>Morning</span>
              <span>Afternoon</span>
              <span>Evening</span>
            </div>
          </motion.div>

          {/* Mindfulness */}
          <div className="bg-[#111114] rounded-3xl p-6 border border-slate-800/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Wind className="text-amber-400" />
                <h3 className="text-lg font-semibold">Mindfulness Break</h3>
              </div>
              <p className="text-slate-400 text-sm">Your screen time has been continuous for 90 minutes.</p>
            </div>
            <button className="mt-6 py-3 bg-slate-800 rounded-xl text-sm">Start Guided Session</button>
          </div>
        </div>

        {/* Stats (compact cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Screen Time', value: '6h 12m', icon: Smartphone, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Eye Strain', value: 'Moderate', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Focus Periods', value: '4 Blocks', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { label: 'Rest Points', value: '240 XP', icon: Battery, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111114] p-4 rounded-2xl border border-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity / Session History */}
        <div className="bg-[#111114] rounded-3xl border border-slate-800/50 overflow-visible">
          <div className="p-4 md:p-6 border-b border-slate-800/50 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold">Session History</h3>
            <button className="text-indigo-400 text-sm">View All</button>
          </div>

          <div className="divide-y divide-slate-800/50">
            {[
              { type: 'Work Session', time: '1:00 PM - 2:30 PM', impact: '+12 Fatigue', icon: Smartphone, iconColor: 'text-slate-400' },
              { type: 'Meditation', time: '12:45 PM - 12:55 PM', impact: '-8 Fatigue', icon: Wind, iconColor: 'text-emerald-400' },
              { type: 'Video Call', time: '11:00 AM - 12:30 PM', impact: '+22 Fatigue', icon: Smartphone, iconColor: 'text-rose-400' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.type}</p>
                    <p className="text-slate-500 text-sm">{item.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${item.impact.startsWith('-') ? 'text-emerald-400' : 'text-slate-400'}`}>{item.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
