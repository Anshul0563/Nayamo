import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("role");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Check role first (fast path)
      if (role !== "admin") {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      // Verify token with backend
      try {
        await authAPI.getProfile();
        setIsAuthenticated(true);
        setIsAdmin(true);
      } catch (err) {
        // Token invalid or expired - will be handled by interceptor
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    verifyAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}

