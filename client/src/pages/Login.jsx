import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Logo from "../components/common/Logo";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      if (!form.name || !form.email || !form.password) {
        setLoading(false);
        return;
      }
      const res = await register(form.name, form.email, form.password);
      if (res.success) navigate("/");
    } else {
      if (!form.email || !form.password) {
        setLoading(false);
        return;
      }
      const res = await login(form.email, form.password);
      if (res.success) navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4A853]/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D4A5A5]/4 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto mb-5">
            <Logo size="2xl" showText={false} glow={true} className="justify-center" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-[#A1A1AA]">
            {isRegister
              ? "Join Nayamo for exclusive jewellery"
              : "Sign in to your Nayamo account"}
          </p>
        </div>

        <div className="nayamo-card p-8 md:p-10 border border-white/[0.05]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="nayamo-input pl-11"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="nayamo-input pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="nayamo-input pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nayamo-btn-primary disabled:opacity-40 mt-2"
            >
              {loading ? (
                <Loader size={20} />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#A1A1AA]">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#D4A853] font-semibold hover:text-[#F0D78C] transition-colors"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

