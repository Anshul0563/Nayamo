import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const getAuthErrorMessage = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (err.request) {
    return "Unable to reach the server. Please check the API URL or CORS settings.";
  }
  return err.message || fallback;
};

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    if (token) {
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data?.data);
          localStorage.setItem("user", JSON.stringify(res.data?.data));
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, "Login failed");
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      const { accessToken, refreshToken, data } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      toast.success("Account created successfully!");
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, "Registration failed");
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const forgotPassword = useCallback(async (payload) => {
    try {
      const email = typeof payload === "string" ? payload : payload?.email;
      await authAPI.forgotPassword({ email });

      toast.success(
        "If an account exists, we sent password reset instructions to your email."
      );
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(
        err,
        "Password reset is not available right now"
      );
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const resetPassword = useCallback(async ({ token, password }) => {
    try {
      await authAPI.resetPassword({ token, password });
      toast.success("Password updated successfully. Please sign in.");
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, "Password reset failed");
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await authAPI.logout(refreshToken ? { refreshToken } : undefined);
    } catch (err) {
      // Ignore errors - still clear local state
    }
    clearAuthStorage();
    setUser(null);
    toast.success("Logged out");
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
