import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  logout: () => apiClient.post("/auth/logout"),
  refresh: () => apiClient.post("/auth/refresh"),
};

// Product APIs
export const productAPI = {
  getProducts: (params) => apiClient.get("/products", { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  getCart: () => apiClient.get("/cart"),
  addToCart: (productId) => apiClient.post("/cart/add", { productId }),
  updateQuantity: (productId, quantity) => apiClient.put("/cart/update", { productId, quantity }),
  removeFromCart: (productId) => apiClient.delete("/cart/remove", { data: { productId } }),
};

// Order APIs
export const orderAPI = {
  placeOrder: (data) => apiClient.post("/orders", data),
  getOrders: () => apiClient.get("/orders"),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
};

// Review APIs
export const reviewAPI = {
  submitReview: (productId, data) => apiClient.post(`/reviews/product/${productId}`, data),
  getReviews: (productId) => apiClient.get(`/reviews/product/${productId}`),
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: () => apiClient.get("/wishlist"),
  addToWishlist: (productId) => apiClient.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) => apiClient.delete("/wishlist/remove", { data: { productId } }),
};

// Contact
export const contactAPI = {
  sendMessage: (data) => apiClient.post("/contact", data),
};

export default apiClient;

