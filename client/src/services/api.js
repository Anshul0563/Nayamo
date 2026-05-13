import axios from "axios";

// ✅ Using CRA environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  throw new Error("❌ REACT_APP_API_URL is not defined");
}

// ✅ Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // IMPORTANT for CORS + cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
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

// ================= RESPONSE INTERCEPTOR =================
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

    const isAuthRoute = originalRequest.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
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
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // ✅ Save tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // ✅ Update default header properly
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        onTokenRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        // ❌ logout fallback
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

// ================= APIs =================

// Auth
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  logout: (data) => apiClient.post("/auth/logout", data || {}),
  logoutAll: () => apiClient.post("/auth/logout-all"),

  // Forgot/Reset Password (placeholders - backend must implement these endpoints)
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
};


// Products
export const productAPI = {
  getProducts: (params) => apiClient.get("/products", { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
};

// Cart
export const cartAPI = {
  getCart: () => apiClient.get("/cart"),
  addToCart: (productId, quantity = 1) =>
  apiClient.post("/cart/add", {
    productId,
    quantity,
  }),
  updateQuantity: (productId, quantity) =>
    apiClient.put("/cart/update", { productId, quantity }),
  removeFromCart: (productId) =>
    apiClient.post("/cart/remove", { productId }),
};

// Wishlist
export const wishlistAPI = {
  getWishlist: () => apiClient.get("/wishlist"),
  addToWishlist: (productId) =>
    apiClient.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) =>
    apiClient.post("/wishlist/remove", { productId }),
};

// Orders
export const orderAPI = {
  placeOrder: (data) => apiClient.post("/orders", data),
  getOrders: () => apiClient.get("/orders"),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
  returnOrder: (id) => apiClient.put(`/orders/${id}/return`),
};

// Payments
export const paymentAPI = {
  createOrder: (data) => apiClient.post("/payment/create-order", data),
  verifyPayment: (data) => apiClient.post("/payment/verify", data),
};

// Contact
export const contactAPI = {
  sendMessage: (data) => apiClient.post("/contact", data),
};

// Reviews
export const reviewAPI = {
  getProductReviews: (productId, params) =>
    apiClient.get(`/reviews/product/${productId}`, { params }),
  submitReview: (productId, data) =>
    apiClient.post(`/reviews/product/${productId}`, data),
};

export default apiClient;
