import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-[#020617] flex items-center justify-center relative overflow-hidden">

      {/* Subtle glow accents */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl px-6 py-6 shadow-2xl">

          <h2 className="text-lg font-semibold text-white text-center">
            Forgot Password
          </h2>

          <p className="text-xs text-slate-400 text-center mt-1 mb-5">
            Enter your email to reset password
          </p>

          {/* Email */}
          <div className="mb-5">
            <label className="text-[11px] text-slate-400 ml-1">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg text-xs font-semibold text-white transition">
            Send Reset Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
