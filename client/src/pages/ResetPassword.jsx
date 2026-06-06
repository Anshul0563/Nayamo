import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import Logo from "../components/common/Logo";

export default function ResetPassword() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = decodeURIComponent(params.token || searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);
    const res = await resetPassword({ token, password });
    setLoading(false);

    if (res.success) {
      navigate("/login");
    } else {
      setError(res.message || "Password reset failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center py-12 px-4 relative overflow-hidden">
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
            Reset Password
          </h1>
          <p className="text-[#A1A1AA]">
            Enter a new password for your account.
          </p>
        </div>

        <div className="nayamo-card p-8 md:p-10 border border-white/[0.05]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3">
                {error}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nayamo-input pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <span>Hide</span>
                ) : (
                  <span>Show</span>
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="nayamo-input pl-11"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nayamo-btn-primary disabled:opacity-40 mt-2"
            >
              {loading ? <Loader size={20} /> : "Update Password"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#A1A1AA]">
              <Link
                to="/login"
                className="text-[#D4A853] font-semibold hover:text-[#F0D78C] transition-colors"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
