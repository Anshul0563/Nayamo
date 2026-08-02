import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import PageLoader from "./components/ui/PageLoader";
import { ToastProvider } from "./components/ui/ToastProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { socketService } from "./services/socket";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const Payments = lazy(() => import("./pages/Payments"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Users = lazy(() => import("./pages/Users"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Returns = lazy(() => import("./pages/Returns"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      return () => socketService.disconnect();
    }
  }, [token]);

  // Global real-time event listeners
  useEffect(() => {
    const handleRealtimeNotification = () => {};

    const handleRefreshDashboard = () => {};

    window.addEventListener('realtime-notification', handleRealtimeNotification);
    window.addEventListener('refresh-dashboard', handleRefreshDashboard);

    return () => {
      window.removeEventListener('realtime-notification', handleRealtimeNotification);
      window.removeEventListener('refresh-dashboard', handleRefreshDashboard);
    };
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <Suspense fallback={<PageLoader label="Preparing the admin workspace" />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="payments" element={<Payments />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="users" element={<Users />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="returns" element={<Returns />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
