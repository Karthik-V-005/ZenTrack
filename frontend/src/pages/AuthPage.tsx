import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useZenStore } from "../store/useStore";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const setUser = useZenStore((s) => s.setUser);

  const apiBaseUrl = (() => {
    const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
    if (envUrl) return envUrl.replace(/\/+$/, "");
    const isProd = Boolean((import.meta as any).env?.PROD);
    return isProd
      ? "https://zentrack-w3xl.onrender.com"
      : "http://localhost:5000";
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isLogin
        ? `${apiBaseUrl}/api/auth/login`
        : `${apiBaseUrl}/api/auth/register`;

      const res = await axios.post(url, { email, password });

      console.log("API RESPONSE 👉", res.data);

      // ✅ LOGIN SUCCESS
      if (isLogin && res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user || null);
        navigate("/dashboard");
      }

      // ✅ REGISTER SUCCESS
      if (!isLogin) {
        alert("Registered successfully. Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.log("AXIOS ERROR 👉", err);
      console.log("AXIOS RESPONSE 👉", err.response);
      console.log("AXIOS DATA 👉", err.response?.data);

      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-[#020617] flex items-center justify-center relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute w-[380px] h-[380px] bg-blue-600/10 blur-[130px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0b1220] border border-white/10 rounded-2xl px-5 py-5 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-white text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-center text-xs text-slate-400 mt-1 mb-5">
            {isLogin
              ? "Sign in to continue your Zen journey"
              : "Start tracking your digital balance"}
          </p>

          {/* FORM */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="text-[11px] text-slate-400 ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] text-slate-400 ml-1">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2 pl-9 pr-9 text-xs text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg text-xs font-semibold text-white transition"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Switch */}
          <p className="mt-4 text-center text-[11px] text-slate-400">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLogin ? "Create one" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
