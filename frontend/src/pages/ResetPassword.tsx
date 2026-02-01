import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#05070d] via-[#070b16] to-[#020409]">

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl px-6 py-6 shadow-2xl">

          <h2 className="text-lg font-semibold text-white text-center">
            Reset Password
          </h2>

          <p className="text-xs text-slate-400 text-center mt-1 mb-5">
            Enter your new password below
          </p>

          {/* New Password */}
          <div className="mb-4">
            <label className="text-[11px] text-slate-400 ml-1">
              New Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="text-[11px] text-slate-400 ml-1">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg text-xs font-semibold text-white transition">
            Update Password
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
