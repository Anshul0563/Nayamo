import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);

  const token = localStorage.getItem("token");

  // Admin API
  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Shipping API
  const shippingApi = axios.create({
    baseURL: "http://localhost:5000/api/shipping",
    headers: { Authorization: `Bearer ${token}` },
  });

  const tabs = [
    ["pending", "Pending"],
    ["confirmed", "Ready To Ship"],
    ["shipped", "Shipped"],
    ["cancelled", "Cancelled"],
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadOrders();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const bulkUpdate = async (status) => {
    try {
      await Promise.all(
        selectedOrders.map((id) =>
          api.put(`/orders/${id}`, { status })
        )
      );
      setSelectedOrders([]);
      loadOrders();
    } catch {
      alert("Bulk failed");
    }
  };

  const shipSelected = async () => {
    try {
      await Promise.all(
        selectedOrders.map((id) =>
          api.put(`/orders/${id}`, { status: "shipped" })
        )
      );
      setSelectedOrders([]);
      loadOrders();
    } catch {
      alert("Ship failed");
    }
  };

  // Create Shipment in Shiprocket
  const createShipment = async () => {
    try {
      await Promise.all(
        selectedOrders.map((id) =>
          shippingApi.post(`/create/${id}`)
        )
      );

      alert("Shipment Created Successfully");
      loadOrders();
    } catch (error) {
      console.log(error);
      alert("Shipment Failed");
    }
  };

  // Download Label
  const downloadLabel = async (id) => {
    try {
      const res = await shippingApi.get(`/label/${id}`);

      const url =
        res.data?.data?.label_url ||
        res.data?.data?.label_url?.[0];

      if (url) {
        window.open(url, "_blank");
      } else {
        alert("Label not available");
      }
    } catch (error) {
      console.log(error);
      alert("Download failed");
    }
  };

  const counts = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders]
  );

  const rows = useMemo(() => {
    let data = orders.filter((o) => o.status === tab);

    if (search.trim()) {
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [orders, tab, search]);

  const toggleOne = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    const ids = rows.map((o) => o._id);

    const allSelected =
      ids.length > 0 &&
      ids.every((id) => selectedOrders.includes(id));

    setSelectedOrders(allSelected ? [] : ids);
  };

  const allChecked =
    rows.length > 0 &&
    rows.every((o) => selectedOrders.includes(o._id));

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center text-2xl">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-zinc-950 to-black text-white">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold">Nayamo 💎</h1>
          <p className="text-zinc-400 text-sm mt-1">Luxury Seller Panel</p>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
          >
            Dashboard
          </button>

          <button className="w-full text-left px-4 py-3 rounded-2xl bg-white text-black font-semibold">
            Orders
          </button>
        </div>

        <div className="mt-auto p-4">
          <button
            onClick={logout}
            className="w-full rounded-2xl bg-red-500 hover:bg-red-600 py-3 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold">Orders Management</h2>
              <p className="text-zinc-400 mt-1">
                Manage all customer orders
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 w-72 outline-none"
              />

              <button
                onClick={loadOrders}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-3 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item[0]}
              onClick={() => {
                setTab(item[0]);
                setSelectedOrders([]);
              }}
              className={`px-5 py-3 rounded-2xl whitespace-nowrap ${
                tab === item[0]
                  ? "bg-white text-black font-semibold"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {item[1]} ({counts[item[0]]})
            </button>
          ))}
        </div>

        {/* Bulk Action Bar */}
        {selectedOrders.length > 0 && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 flex flex-wrap gap-3 justify-between items-center">
            <p>{selectedOrders.length} selected</p>

            <div className="flex gap-3 flex-wrap">
              {tab === "pending" && (
                <>
                  <button
                    onClick={() => bulkUpdate("confirmed")}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    Confirm Selected
                  </button>

                  <button
                    onClick={() => bulkUpdate("cancelled")}
                    className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700"
                  >
                    Cancel Selected
                  </button>
                </>
              )}

              {tab === "confirmed" && (
                <>
                  <button
                    onClick={createShipment}
                    className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700"
                  >
                    Create Shipment
                  </button>

                  <button
                    onClick={shipSelected}
                    className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700"
                  >
                    Ship Selected
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Orders Cards */}
        <div className="grid gap-4 mt-6">
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              No Orders Found
            </div>
          ) : (
            rows.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex justify-between gap-4 flex-wrap">
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleOne(order._id)}
                      className="w-5 h-5 mt-1"
                    />

                    <div>
                      <h3 className="text-xl font-semibold">
                        #{order._id.slice(-6)}
                      </h3>

                      <p className="text-zinc-300 mt-1">
                        {order.user?.name}
                      </p>

                      <p className="text-zinc-500 text-sm">
                        {order.user?.email}
                      </p>

                      <p className="text-zinc-400 text-sm mt-2">
                        {order.address}
                      </p>

                      {order.shiprocket?.awb && (
                        <p className="text-green-400 text-sm mt-2">
                          AWB: {order.shiprocket.awb}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      ₹{order.totalPrice}
                    </p>

                    <p className="text-zinc-400 text-sm mt-2">
                      {order.items.length} Items
                    </p>

                    <p className="text-sm capitalize mt-2">
                      {order.status}
                    </p>

                    {tab === "confirmed" &&
                      order.shiprocket?.shipmentId && (
                        <button
                          onClick={() =>
                            downloadLabel(order._id)
                          }
                          className="mt-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm"
                        >
                          Download Label
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Select All */}
        {rows.length > 0 && (
          <div className="mt-6">
            <button
              onClick={toggleAll}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
            >
              {allChecked
                ? "Unselect All"
                : "Select All Visible Orders"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}