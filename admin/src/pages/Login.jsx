import { useState } from "react";
import { authAPI } from "../services/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const { accessToken, refreshToken, data: userData } = res.data;

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", userData?.role || "user");

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        if (userData?.role === "admin") {
          window.location.href = "/";
        } else {
          setError("Access denied. Admin privileges required.");
          localStorage.clear();
        }
      }, 700);
    } catch (err) {
      let message = "Login failed. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data || {};

        if (status === 503 && data.code === "DB_UNAVAILABLE") {
          message =
            "Database unavailable. Check MongoDB Atlas IP access or MONGO_URI.";
        } else {
          message = data.message || `Server error: ${status}`;
        }
      } else if (err.request) {
        message =
          "Cannot reach server. Please check backend is running on port 5000.";
      } else {
        message = err.message || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-gold-gradient-radial blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-gold-gradient-soft blur-3xl opacity-30 gold-pulse" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border-gold-animated bg-luxury-card/90 backdrop-blur-glass shadow-gold-xl p-6 md:p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-lg">
            <Crown size={28} className="text-black" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-400 mb-2">
            Nayamo Luxury
          </p>

          <h1 className="text-3xl font-bold text-gold-gradient text-glow-gold">
            Welcome Back
          </h1>

          <p className="text-zinc-400 mt-2 text-sm">
            Login to access premium admin dashboard
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                placeholder="admin@nayamo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input h-12 pl-11 pr-4"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
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
                className="luxury-input h-12 pl-11 pr-12"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-gold-400 transition"
                disabled={loading}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-gold-400" />
              Secure JWT Login
            </div>

            <span>Admin Only</span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="luxury-btn-primary w-full h-12 rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Crown size={18} />
                Access Dashboard
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Nayamo • Premium Admin Access
        </div>
      </div>
    </div>
  );
}