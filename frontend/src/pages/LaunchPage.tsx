import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function LaunchPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-[#020617] flex items-center justify-center relative overflow-hidden">

      {/* Subtle glow accents */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 max-w-3xl px-6 text-center"
      >
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-400/30">
          <Zap className="h-8 w-8 text-blue-400" />
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          Zen<span className="text-blue-400">Track</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl leading-relaxed text-slate-300">
          A calm, minimalist digital fatigue tracking platform.  
          Understand your usage patterns and restore balance — without noise.
        </p>

        {/* CTA Buttons */}
<div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
  <button className="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-500 hover:scale-105">
    Get Started
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </button>

  <button className="rounded-full border border-blue-500 px-6 py-3 text-base font-medium text-white transition hover:bg-blue-500/15 hover:scale-105">
    Learn More
  </button>
</div>

      </motion.div>

     
    </div>
  );
}
