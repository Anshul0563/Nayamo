import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {}
      }

      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.data);
          localStorage.setItem("user", JSON.stringify(res.data.data));
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { accessToken, refreshToken, data } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      toast.success("Welcome back!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {}
    
    localStorage.clear();
    setUser(null);
    toast.success("Logged out");
    window.location.href = "/";
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

