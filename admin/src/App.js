import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ui/ToastProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import { socketService } from "./services/socket";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Returns from "./pages/Returns";
import Settings from "./pages/Settings";


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
    const handleRealtimeNotification = (e) => {
      // Trigger toast via event
      // ToastProvider will catch this
      console.log('Real-time notification received:', e.detail);
    };

    const handleRefreshDashboard = () => {};

    window.addEventListener('realtime-notification', handleRealtimeNotification);
    window.addEventListener('refresh-dashboard', handleRefreshDashboard);
    
    return () => {
      window.removeEventListener('realtime-notification', handleRealtimeNotification);
      window.removeEventListener('refresh-dashboard', handleRefreshDashboard);
    };
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
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
            <Route path="returns" element={<Returns />} />
            <Route path="settings" element={<Settings />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
