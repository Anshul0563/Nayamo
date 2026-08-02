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
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // The server verifies both token validity and the admin role.
      try {
        const response = await authAPI.getAdminProfile();
        if (response.data?.data?.role !== "admin") {
          throw new Error("Admin role is required");
        }
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
        <Loader2 size={32} className="animate-spin text-[#D4A853]" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  return children;
}
