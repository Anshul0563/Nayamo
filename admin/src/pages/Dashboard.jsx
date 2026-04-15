import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState({ totalOrders: 0, totalUsers: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState("dashboard");

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return (window.location.href = "/login");
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menu = ["dashboard", "users", "orders", "products", "analytics", "reviews", "coupons", "settings"];

  const StatCard = ({ title, value, sub }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition shadow-2xl">
      <p className="text-zinc-400 text-sm">{title}</p>
      <h2 className="text-4xl font-bold mt-2">{value}</h2>
      <p className="text-emerald-400 text-sm mt-2">{sub}</p>
    </div>
  );

  const Table = ({ rows, type }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 overflow-auto">
      <h3 className="text-xl font-semibold mb-4 capitalize">{type} List</h3>
      <table className="w-full text-left min-w-[600px]">
        <thead className="text-zinc-400 border-b border-white/10">
          <tr>
            {Object.keys(rows[0] || {}).map((k) => <th key={k} className="py-3">{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              {Object.values(row).map((v, idx) => <td key={idx} className="py-3">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPage = () => {
    if (active === "users") return <Table type="users" rows={[{ Name: "Anshul", Email: "anshul@mail.com", Role: "Admin" }, { Name: "Riya", Email: "riya@mail.com", Role: "User" }]} />;
    if (active === "orders") return <Table type="orders" rows={[{ ID: "#1001", Customer: "Riya", Amount: "₹1299", Status: "Pending" }, { ID: "#1002", Customer: "Aman", Amount: "₹999", Status: "Delivered" }]} />;
    if (active === "products") return <Table type="products" rows={[{ Name: "Gold Earring", Price: "₹799", Stock: 25 }, { Name: "Silver Payal", Price: "₹1299", Stock: 8 }]} />;
    if (active === "analytics") return <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><h3 className="text-2xl font-bold">Analytics</h3><p className="text-zinc-400 mt-2">Growth +24%, Conversion 8.6%, Returning users 32%</p></div>;
    if (active === "reviews") return <Table type="reviews" rows={[{ User: "Riya", Rating: "5★", Comment: "Amazing earrings" }, { User: "Aman", Rating: "4★", Comment: "Great quality" }]} />;
    if (active === "coupons") return <Table type="coupons" rows={[{ Code: "NAYAMO10", Discount: "10%", Status: "Active" }, { Code: "FESTIVE20", Discount: "20%", Status: "Expired" }]} />;
    if (active === "settings") return <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><h3 className="text-2xl font-bold">Settings</h3><p className="text-zinc-400 mt-2">Store settings, payment, shipping, branding.</p></div>;

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Total Users" value={data.totalUsers} sub="+12% this month" />
          <StatCard title="Total Orders" value={data.totalOrders} sub="+8 new today" />
          <StatCard title="Products" value={data.totalProducts} sub="5 low stock" />
          <StatCard title="Revenue" value={`₹${data.totalRevenue}`} sub="+18% growth" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 min-h-[320px]">
            <h3 className="text-2xl font-bold">Live Business Insights</h3>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="rounded-2xl bg-black/30 p-4"><p className="text-zinc-400">Best Seller</p><p className="text-xl font-bold mt-1">Diamond Earring</p></div>
              <div className="rounded-2xl bg-black/30 p-4"><p className="text-zinc-400">Pending Orders</p><p className="text-xl font-bold mt-1">12</p></div>
              <div className="rounded-2xl bg-black/30 p-4"><p className="text-zinc-400">Returning Users</p><p className="text-xl font-bold mt-1">32%</p></div>
              <div className="rounded-2xl bg-black/30 p-4"><p className="text-zinc-400">Cart Conversion</p><p className="text-xl font-bold mt-1">8.6%</p></div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold">Quick Actions</h3>
            <div className="grid gap-3 mt-4">
              <button className="rounded-2xl bg-white/10 p-3 hover:bg-white/20">Add Product</button>
              <button className="rounded-2xl bg-white/10 p-3 hover:bg-white/20">Create Coupon</button>
              <button className="rounded-2xl bg-white/10 p-3 hover:bg-white/20">Export Report</button>
              <button className="rounded-2xl bg-white/10 p-3 hover:bg-white/20">Manage Orders</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) return <div className="min-h-screen bg-black text-white grid place-items-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-red-400 grid place-items-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white flex">
      <aside className="w-72 border-r border-white/10 p-6 hidden md:block">
        <h1 className="text-3xl font-bold">Nayamo</h1>
        <p className="text-zinc-400 text-sm mt-1">Luxury Admin Panel</p>
        <div className="grid gap-2 mt-8">
          {menu.map((item) => (
            <button key={item} onClick={() => setActive(item)} className={`text-left capitalize px-4 py-3 rounded-2xl transition ${active === item ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"}`}>
              {item}
            </button>
          ))}
        </div>
        <button onClick={logout} className="w-full mt-8 rounded-2xl bg-red-500 p-3">Logout</button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold capitalize">{active}</h2>
            <p className="text-zinc-400">Welcome back, manage your store like a pro.</p>
          </div>
          <div className="flex gap-3"><input placeholder="Search anything..." className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none"/><button onClick={fetchDashboard} className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/20">Refresh</button></div>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}
