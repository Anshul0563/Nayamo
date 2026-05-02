import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach access token
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

// Response interceptor - handle token refresh on 401
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        onTokenRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  logout: () => apiClient.post("/auth/logout"),
  logoutAll: () => apiClient.post("/auth/logout-all"),
};

// Product APIs
export const productAPI = {
  getProducts: (params) => apiClient.get("/products", { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  getCart: () => apiClient.get("/cart"),
  addToCart: (productId) => apiClient.post("/cart/add", { productId }),
  updateQuantity: (productId, quantity) =>
    apiClient.put("/cart/update", { productId, quantity }),
  removeFromCart: (productId) =>
    apiClient.post("/cart/remove", { productId }),
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: () => apiClient.get("/wishlist"),
  addToWishlist: (productId) =>
    apiClient.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) =>
    apiClient.post("/wishlist/remove", { productId }),
};

// Order APIs
export const orderAPI = {
  placeOrder: (data) => apiClient.post("/orders", data),
  getOrders: () => apiClient.get("/orders"),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
  returnOrder: (id) => apiClient.put(`/orders/${id}/return`),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => apiClient.post("/payment/create-order", data),
  verifyPayment: (data) => apiClient.post("/payment/verify", data),
};

// Contact APIs
export const contactAPI = {
  sendMessage: (data) => apiClient.post("/contact", data),
};

// Review APIs
export const reviewAPI = {
  getProductReviews: (productId, params) => apiClient.get(`/reviews/product/${productId}`, { params }),
  submitReview: (productId, data) => apiClient.post(`/reviews/product/${productId}`, data),
};

export default apiClient;

