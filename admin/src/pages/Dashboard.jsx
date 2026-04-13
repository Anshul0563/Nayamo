import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔥 agar token nahi → redirect
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data.data);

      } catch (err) {
        console.log(err);

        if (err.response) {
          // 🔥 invalid token → logout
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }

          setError(err.response.data.message || "Something went wrong ❌");
        } else {
          setError("Network error ❌");
        }
      }
    };

    fetchDashboard();
  }, []);

  // 🚪 logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // 🔄 loading
  if (!data && !error) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </h2>
    );
  }

  // ❌ error
  if (error) {
    return (
      <h2 style={{ textAlign: "center", color: "red" }}>
        {error}
      </h2>
    );
  }

  // dashboard UI
  return (
    <div style={{ padding: "20px" }}>
      
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Admin Dashboard 💎</h1>
        <button onClick={handleLogout}>Logout 🚪</button>
      </div>

      {/* Stats */}
      <div style={{ marginTop: "20px" }}>
        <h3>Total Orders: {data.totalOrders}</h3>
        <h3>Total Users: {data.totalUsers}</h3>
        <h3>Total Products: {data.totalProducts}</h3>
        <h3>Total Revenue: ₹{data.totalRevenue}</h3>
      </div>
    </div>
  );
}