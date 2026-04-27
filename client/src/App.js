import React from "react";
import { Routes, Route } from "react-router-dom";
import ClientLayout from "./components/layout/ClientLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-stone-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-stone-800 mb-2">Page Not Found</h2>
        <p className="text-stone-500 mb-6">The page you are looking for does not exist.</p>
        <a href="/" className="nayamo-btn-primary inline-block">Go Home</a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

