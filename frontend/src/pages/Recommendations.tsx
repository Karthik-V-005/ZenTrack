import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Wind,
  Eye,
  Brain,
  Sun,
  Coffee,
  BookOpen,
  Music,
  X,
  Play,
  Check,
  Bell,
  Clock
} from 'lucide-react';

const recommendations = [
  {
    title: "The 20-20-20 Rule",
    description: "Every 20 minutes, look at something 20 feet away for at least 20 seconds.",
    category: "Eyes",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    durationSeconds: 20,
    timeLabel: "20s",
    steps: [
      "Finish current fine-grained task",
      "Look at an object ~20 ft away",
      "Count to 20 slowly",
      "Return to task refreshed"
    ]
  },
  {
    title: "Box Breathing",
    description: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 4 times.",
    category: "Mind",
    icon: Wind,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    durationSeconds: 60,
    timeLabel: "1m",
    steps: [
      "Sit upright and relax shoulders",
      "Inhale for 4 seconds",
      "Hold for 4 seconds",
      "Exhale for 4 seconds",
      "Repeat 4 times"
    ]
  },
  {
    title: "Hydration Reminder",
    description: "You haven't logged water in 3 hours. A quick glass of water can boost focus.",
    category: "Body",
    icon: Coffee,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    durationSeconds: 120,
    timeLabel: "2m",
    steps: ["Get a glass of water", "Drink slowly", "Log it in your tracker"]
  },
  {
    title: "Blue Light Filter",
    description: "It's getting late. Consider turning on night shift or wearing blue light glasses.",
    category: "Sleep",
    icon: Sun,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    durationSeconds: 30,
    timeLabel: "30s",
    steps: ["Enable night shift or blue light filter", "Reduce screen brightness", "Avoid bright screens for 30 minutes"]
  },
  {
    title: "Mono-tasking",
    description: "Close 5 tabs that you aren't currently using to reduce cognitive load.",
    category: "Focus",
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    durationSeconds: 300,
    timeLabel: "5m",
    steps: ["Identify top priority tab", "Close irrelevant tabs", "Set a 5-minute focused timer"]
  },
  {
    title: "Reading Break",
    description: "Switch to a physical book for 15 minutes to give your eyes a rest from pixels.",
    category: "Eyes",
    icon: BookOpen,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    durationSeconds: 900,
    timeLabel: "15m",
    steps: ["Put aside devices", "Pick a short chapter or section", "Read for 15 minutes"]
  }
];

export const Recommendations = () => {
  const [activeRec, setActiveRec] = React.useState<null | (typeof recommendations)[0]>(null);
  const [secondsLeft, setSecondsLeft] = React.useState<number>(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    if (activeRec) {
      setSecondsLeft(activeRec.durationSeconds || 0);
      setIsRunning(false);
      setCompleted(false);
    } else {
      setSecondsLeft(0);
      setIsRunning(false);
      setCompleted(false);
    }
  }, [activeRec]);

  React.useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setIsRunning(false);
          setCompleted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const startActivity = () => {
    if (!activeRec) return;
    if ((activeRec.durationSeconds || 0) <= 0) {
      setCompleted(true);
      return;
    }
    setIsRunning(true);
  };

  const markComplete = () => {
    setCompleted(true);
    setIsRunning(false);
    setSecondsLeft(0);
  };

  const remindLater = () => {
    setActiveRec(null);
  };

  const getInsight = (rec: typeof recommendations[0]) => {
    return `Based on typical ${rec.category.toLowerCase()} patterns and your recent activity, this recommendation helps reduce strain and refocus attention.`;
  };

  const formatTime = (s: number) => {
    if (s >= 60) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}m${sec ? ` ${sec}s` : ''}`;
    }
    return `${s}s`;
  };

  const ProgressRing: React.FC<{size?: number; stroke?: number; progress: number}> = ({ size = 64, stroke = 6, progress }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="url(#g1)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} fill="none" />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Recommendations</h1>
        </div>
        
        <p className="text-slate-500">AI-curated tips to improve your digital wellbeing.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-[#111114] border border-slate-800/50 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl ${rec.bg}`}>
                <rec.icon className={`w-6 h-6 ${rec.color}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-800/50 px-2 py-1 rounded">
                {rec.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
              {rec.title}
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              {rec.description}
            </p>
            
            <button
              onClick={() => setActiveRec(rec)}
              className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all"
            >
              Try This Now
            </button>

          </motion.div>
        ))}
      </div>

      {/* ===== Expanded Card Modal (glassmorphism + timer + steps) ===== */}
      {activeRec && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveRec(null)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-[95%] md:w-2/3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl text-white"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${activeRec.bg} flex items-center justify-center`}>
                  <activeRec.icon className={`w-7 h-7 ${activeRec.color}`} />
                </div>
                <div>
                  <div className="text-sm uppercase font-bold text-slate-300 px-2 py-1 rounded bg-white/3 inline-block">{activeRec.category}</div>
                  <h2 className="text-2xl md:text-3xl font-bold mt-2">{activeRec.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveRec(null)} className="p-2 rounded-full hover:bg-white/5">
                  <X className="w-5 h-5 text-slate-200" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <p className="text-slate-300 mb-4">{activeRec.description}</p>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">Why this is suggested</h3>
                  <p className="text-slate-400">{getInsight(activeRec)}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">How to do it</h3>
                  <ol className="list-decimal list-inside text-slate-300 space-y-2">
                    {activeRec.steps?.map((s, i) => (
                      <li key={i} className="text-sm">{s}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex flex-col items-center justify-start gap-4">
                <div className="relative">
                  <ProgressRing
                    size={92}
                    stroke={6}
                    progress={
                      activeRec.durationSeconds
                        ? Math.round(((activeRec.durationSeconds - secondsLeft) / activeRec.durationSeconds) * 100)
                        : 0
                    }
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-200 mb-1" />
                    <div className="text-sm font-bold text-white">{activeRec.timeLabel}</div>
                    <div className="text-xs text-slate-400">{isRunning ? formatTime(secondsLeft) : formatTime(secondsLeft || activeRec.durationSeconds)}</div>
                  </div>
                </div>

                <div className="w-full">
                  {!completed ? (
                    <>
                      <button onClick={startActivity} className="w-full py-3 mb-2 bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                      <button onClick={markComplete} className="w-full py-3 mb-2 bg-white/5 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-emerald-300" />
                        Mark as Completed
                      </button>
                      <button onClick={remindLater} className="w-full py-2 bg-white/3 rounded-xl text-sm">
                        <Bell className="w-4 h-4 inline-block mr-2" />
                        Remind / Postpone
                      </button>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-700/10 text-emerald-300 text-center">Completed ✓</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Featured Recommendation */}
      <div className="relative rounded-[40px] overflow-hidden bg-indigo-600 p-10 md:p-16 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase mb-6 backdrop-blur-md">
            <Music className="w-4 h-4" />
            Special Focus Session
          </div>
          <h2 className="text-4xl font-bold mb-6">Deep Work Ambient Mix</h2>
          <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
            We've generated a 45-minute binaural beats playlist specifically designed for your current cognitive state. It helps synchronize your brainwaves for peak flow.
          </p>
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold shadow-xl hover:scale-105 transition-all">
            Listen Now
          </button>
        </div>
      </div>
    </div>
  );
};