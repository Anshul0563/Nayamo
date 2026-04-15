import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const tabs = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Ready to Ship" },
    { key: "shipped", label: "Shipped" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const counts = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      loadOrders();
    } catch (error) {
      alert("Status update failed");
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top Banner */}
      <div style={styles.banner}>
        <div>
          <h2 style={{ margin: 0 }}>Get better visibility into your dispatch health</h2>
          <p style={styles.bannerText}>
            Track dispatch health, catalog status and order performance insights.
          </p>
        </div>

        <button style={styles.bannerBtn}>Check Dispatch Health</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            style={{
              ...styles.tabBtn,
              color: tab === item.key ? "#4f46e5" : "#333",
              borderBottom:
                tab === item.key
                  ? "2px solid #4f46e5"
                  : "2px solid transparent",
            }}
          >
            {item.label} ({counts[item.key]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <span style={{ fontSize: 14 }}>Filter by :</span>

        <select style={styles.select}>
          <option>SLA Status</option>
        </select>

        <select style={styles.select}>
          <option>Dispatch Date</option>
        </select>

        <select style={styles.select}>
          <option>Order Date</option>
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <select style={styles.select}>
            <option>SKU ID</option>
          </select>

          <input
            type="text"
            placeholder="Search order / customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Payment</th>
              <th style={styles.th}>Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.empty}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td style={styles.td}>#{order._id.slice(-6)}</td>

                  <td style={styles.td}>
                    <div>{order.user?.name || "User"}</div>
                    <small style={{ color: "#777" }}>
                      {order.user?.email}
                    </small>
                  </td>

                  <td style={styles.td}>₹{order.totalPrice}</td>

                  <td style={styles.td}>{order.items.length}</td>

                  <td style={styles.td}>{order.address}</td>

                  <td style={styles.td}>{order.paymentMethod}</td>

                  <td style={styles.td}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                      style={styles.selectSmall}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="packed">packed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f6fa",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f6fa",
  },

  banner: {
    background: "#eef1f8",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  bannerText: {
    marginTop: "6px",
    color: "#666",
    fontSize: "14px",
  },

  bannerBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  tabs: {
    display: "flex",
    gap: "25px",
    marginTop: "18px",
    borderBottom: "1px solid #ddd",
    overflowX: "auto",
  },

  tabBtn: {
    background: "transparent",
    border: "none",
    padding: "14px 2px",
    cursor: "pointer",
    fontSize: "16px",
    whiteSpace: "nowrap",
  },

  filters: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "16px",
    background: "#fff",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
  },

  search: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    minWidth: "260px",
  },

  tableWrap: {
    marginTop: "16px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #eee",
    color: "#555",
    fontSize: "14px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #f1f1f1",
    fontSize: "14px",
    color: "#111",
  },

  selectSmall: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#777",
  },
};