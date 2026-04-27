import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A5A5]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C9963B] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(212,168,83,0.3)]">
            <Sparkles className="w-6 h-6 text-[#0A0A0A]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-[#9CA3AF]">
            {isRegister ? "Join Nayamo for exclusive jewellery" : "Sign in to your Nayamo account"}
          </p>
        </div>

        <div className="nayamo-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="nayamo-input pl-10"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="nayamo-input pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="nayamo-input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nayamo-btn-primary disabled:opacity-50"
            >
              {loading ? <Loader size={20} /> : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#D4A853] font-medium hover:underline"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

