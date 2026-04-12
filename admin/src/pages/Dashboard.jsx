import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => setData(res.data.data));
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Admin Dashboard 💎</h1>

      <h3>Total Orders: {data.totalOrders}</h3>
      <h3>Total Users: {data.totalUsers}</h3>
      <h3>Total Products: {data.totalProducts}</h3>
      <h3>Total Revenue: ₹{data.totalRevenue}</h3>
    </div>
  );
}