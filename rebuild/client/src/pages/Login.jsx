import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-nayamo-bg-primary flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full nayamo-glass rounded-3xl p-10 border backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-4">
            Welcome Back
          </h1>
          <p className="text-nayamo-text-muted">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-nayamo-text-secondary text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="nayamo-input w-full"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-nayamo-text-secondary text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="nayamo-input w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full nayamo-btn-primary py-4 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-nayamo-text-muted">
            Don't have an account? <Link to="/register" className="text-nayamo-gold hover:text-yellow-400 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

