// FILE: admin/src/pages/Login.jsx

import { useState } from "react";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Please fill all fields ❌");
        return;
      }

      const res = await axios.post(
        "http://localhost:5050/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/user";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow Background */}
      <div className="absolute w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full top-10 left-10" />
      <div className="absolute w-72 h-72 bg-fuchsia-600/20 blur-3xl rounded-full bottom-10 right-10" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-6 md:p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={28} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Login to access Nayamo Admin Panel
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-indigo-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember + Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Secure JWT Login</span>
            <span className="text-zinc-500">Admin Only</span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-60 font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Nayamo • Premium Admin Access
        </div>
      </div>
    </div>
  );
}