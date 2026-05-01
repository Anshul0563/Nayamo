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
    if (validationError) return setError(validationError);

    try {
      setLoading(true);

      const res = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const { accessToken, refreshToken, data: userData } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", userData?.role || "user");

      setSuccess("Login successful!");

      setTimeout(() => {
        if (userData?.role === "admin") {
          window.location.href = "/";
        } else {
          setError("Admin access only");
          localStorage.clear();
        }
      }, 700);
    } catch (err) {
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* GOLD GLOW BACKGROUND */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-yellow-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-yellow-400/10 blur-3xl" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#0d0d0d] shadow-[0_0_40px_rgba(212,168,83,0.15)] p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center">
            <Crown size={28} className="text-black" />
          </div>
        </div>

        {/* TITLE */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Nayamo
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Premium Admin Login
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-300 p-3 rounded-xl flex gap-2">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                className="w-full bg-black border border-gray-700 text-white pl-10 pr-3 py-3 rounded-xl focus:border-yellow-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />

              <input
                type={showPass ? "text" : "password"}
                className="w-full bg-black border border-gray-700 text-white pl-10 pr-10 py-3 rounded-xl focus:border-yellow-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* INFO */}
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex gap-2 items-center">
              <ShieldCheck size={16} className="text-yellow-400" />
              Secure Login
            </div>
            <span>Admin</span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold hover:scale-105 transition"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Nayamo
        </div>
      </div>
    </div>
  );
}