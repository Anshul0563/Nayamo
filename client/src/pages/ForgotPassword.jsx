import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "../services/api";
import Loader from "../components/common/Loader";
import Logo from "../components/common/Logo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await authAPI.forgotPassword({
        email,
      });

      setSuccess(
        res.data?.message ||
          "If an account exists, reset instructions have been sent."
      );

    } catch (err) {

      setError(
        err.response?.data?.message ||
          "Failed to send reset email."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center py-12 px-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4A853]/4 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >

        <div className="text-center mb-10">
          <div className="mx-auto mb-5">
            <Logo
              size="2xl"
              showText={false}
              glow={true}
              className="justify-center"
            />
          </div>

          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Forgot Password
          </h1>

          <p className="text-[#A1A1AA]">
            Enter your email to receive reset instructions.
          </p>
        </div>

        <div className="nayamo-card p-8 md:p-10 border border-white/[0.05]">

          <form onSubmit={handleSubmit} className="space-y-5">

            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nayamo-input pl-11"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nayamo-btn-primary disabled:opacity-40"
            >
              {loading ? <Loader size={20} /> : "Send Reset Link"}
            </button>

          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-[#D4A853] font-semibold hover:text-[#F0D78C]"
            >
              Back to Login
            </Link>
          </div>

        </div>

      </motion.div>
    </div>
  );
}