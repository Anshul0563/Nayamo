import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        // ❌ token nahi hai
        if (!token) {
          setError("No token found. Please login ❌");
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
          setError(err.response.data.message || "Something went wrong ❌");
        } else {
          setError("Network error ❌");
        }
      }
    };

    fetchDashboard();
  }, []);

  // 🔄 loading
  if (!data && !error) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  // ❌ error show
  if (error) {
    return (
      <h2 style={{ textAlign: "center", color: "red" }}>
        {error}
      </h2>
    );
  }

  // ✅ dashboard
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard 💎</h1>

      <div style={{ marginTop: "20px" }}>
        <h3>Total Orders: {data.totalOrders}</h3>
        <h3>Total Users: {data.totalUsers}</h3>
        <h3>Total Products: {data.totalProducts}</h3>
        <h3>Total Revenue: ₹{data.totalRevenue}</h3>
      </div>
    </div>
  );
}