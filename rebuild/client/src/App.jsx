import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import ClientLayout from "@/components/layout/ClientLayout";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Loader from "@/components/common/Loader";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/Login"));
const Profile = lazy(() => import("@/pages/Profile"));
const MyOrders = lazy(() => import("@/pages/MyOrders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-nayamo-bg-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-nayamo-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-nayamo-text-primary mb-2">Page Not Found</h2>
        <p className="text-nayamo-text-muted mb-6">The page you are looking for does not exist.</p>
        <a href="/" className="nayamo-btn-primary inline-block">
          Go Home
        </a>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          } />
          <Route path="/shop" element={
            <Suspense fallback={<Loader />}>
              <Shop />
            </Suspense>
          } />
          <Route path="/product/:id" element={
            <Suspense fallback={<Loader />}>
              <ProductDetails />
            </Suspense>
          } />
          <Route path="/cart" element={
            <Suspense fallback={<Loader />}>
              <Cart />
            </Suspense>
          } />
          <Route path="/checkout" element={
            <Suspense fallback={<Loader />}>
              <Checkout />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<Loader />}>
              <Login />
            </Suspense>
          } />
          <Route path="/profile" element={
            <Suspense fallback={<Loader />}>
              <Profile />
            </Suspense>
          } />
          <Route path="/orders" element={
            <Suspense fallback={<Loader />}>
              <MyOrders />
            </Suspense>
          } />
          <Route path="/orders/:id" element={
            <Suspense fallback={<Loader />}>
              <OrderDetails />
            </Suspense>
          } />
          <Route path="/track-order" element={
            <Suspense fallback={<Loader />}>
              <TrackOrder />
            </Suspense>
          } />
          <Route path="/wishlist" element={
            <Suspense fallback={<Loader />}>
              <Wishlist />
            </Suspense>
          } />
          <Route path="/about" element={
            <Suspense fallback={<Loader />}>
              <About />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<Loader />}>
              <Contact />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

