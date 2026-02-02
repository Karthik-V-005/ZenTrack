import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Wind, Eye, Brain, Sun, Coffee, BookOpen, Music } from 'lucide-react';

const recommendations = [
  {
    title: "The 20-20-20 Rule",
    description: "Every 20 minutes, look at something 20 feet away for at least 20 seconds.",
    category: "Eyes",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    title: "Box Breathing",
    description: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 4 times.",
    category: "Mind",
    icon: Wind,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10"
  },
  {
    title: "Hydration Reminder",
    description: "You haven't logged water in 3 hours. A quick glass of water can boost focus.",
    category: "Body",
    icon: Coffee,
    color: "text-amber-400",
    bg: "bg-amber-400/10"
  },
  {
    title: "Blue Light Filter",
    description: "It's getting late. Consider turning on night shift or wearing blue light glasses.",
    category: "Sleep",
    icon: Sun,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10"
  },
  {
    title: "Mono-tasking",
    description: "Close 5 tabs that you aren't currently using to reduce cognitive load.",
    category: "Focus",
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    title: "Reading Break",
    description: "Switch to a physical book for 15 minutes to give your eyes a rest from pixels.",
    category: "Eyes",
    icon: BookOpen,
    color: "text-rose-400",
    bg: "bg-rose-400/10"
  }
];

export const Recommendations = () => {
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
            
            <button className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all">
              Try This Now
            </button>
          </motion.div>
        ))}
      </div>

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