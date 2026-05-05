import axios from "axios";

// ✅ STRICT ENV (NO FALLBACK)
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}

// ✅ AXIOS INSTANCE
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST =================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true } // ✅ FIXED
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // ✅ SAVE TOKENS
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // ✅ PROPER HEADER UPDATE
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        onTokenRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        // ❌ CLEAN LOGOUT
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ================= ADMIN APIs =================
export const adminAPI = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  getStats: () => apiClient.get("/admin/stats"),

  getNotifications: (params = {}) =>
    apiClient.get("/admin/notifications", { params }),
  markNotificationRead: (id) =>
    apiClient.patch(`/admin/notifications/${id}/read`),
  deleteNotification: (id) =>
    apiClient.delete(`/admin/notifications/${id}`),
  deleteAllNotifications: () =>
    apiClient.delete("/admin/notifications/all"),

  getRecentActivity: (params = {}) =>
    apiClient.get("/admin/recent-activity", { params }),
  getTopProducts: (params = {}) =>
    apiClient.get("/admin/top-products", { params }),

  getAnalytics: (params = {}) =>
    apiClient.get("/admin/analytics", { params }),
  getRevenueData: (params = {}) =>
    apiClient.get("/admin/revenue", { params }),
  getConversionData: (params = {}) =>
    apiClient.get("/admin/conversion", { params }),

  getOrders: (params = {}) =>
    apiClient.get("/admin/orders", { params }),
  getOrderById: (id) =>
    apiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) =>
    apiClient.put(`/admin/orders/${id}`, data),
  getOrderStats: () =>
    apiClient.get("/admin/orders/stats"),
  exportOrders: (params = {}) =>
    apiClient.get("/admin/orders/export", {
      params,
      responseType: "blob",
    }),

  getProducts: (params = {}) =>
    apiClient.get("/admin/products", { params }),
  updateProduct: (id, data) =>
    apiClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) =>
    apiClient.delete(`/admin/products/${id}`),
  uploadImage: (formData) =>
    apiClient.post("/admin/products/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createProduct: (data) =>
    apiClient.post("/products", data),

  getUsers: (params = {}) =>
    apiClient.get("/admin/users", { params }),
  updateUser: (id, data) =>
    apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) =>
    apiClient.delete(`/admin/users/${id}`),

  getReviews: (params = {}) =>
    apiClient.get("/admin/reviews", { params }),
  approveReview: (id) =>
    apiClient.patch(`/admin/reviews/${id}/approve`),
  rejectReview: (id, reason) =>
    apiClient.patch(`/admin/reviews/${id}/reject`, { reason }),
  deleteReview: (id) =>
    apiClient.delete(`/admin/reviews/${id}`),

  getPayments: (params = {}) =>
    apiClient.get("/admin/payments", { params }),

  getReturns: (params = {}) =>
    apiClient.get("/admin/returns", { params }),
  updateReturnStatus: (id, data) =>
    apiClient.put(`/admin/returns/${id}`, data),

  getSettings: () =>
    apiClient.get("/admin/settings"),
  updateSettings: (data) =>
    apiClient.put("/admin/settings", data),
};

// ================= AUTH =================
export const authAPI = {
  login: (credentials) =>
    apiClient.post("/auth/login", credentials),
  register: (data) =>
    apiClient.post("/auth/register", data),
  getProfile: () =>
    apiClient.get("/auth/profile"),
  updateProfile: (data) =>
    apiClient.put("/auth/profile", data),

  refresh: (refreshToken) =>
    axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true } // ✅ FIXED
    ),
};

// ================= PUBLIC =================
export const publicAPI = {
  getProducts: (params = {}) =>
    apiClient.get("/products", { params }),
  getProductById: (id) =>
    apiClient.get(`/products/${id}`),
};

export default apiClient;