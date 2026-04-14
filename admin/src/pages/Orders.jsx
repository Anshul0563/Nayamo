import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/orders/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Orders 📦</h1>

      {orders.length === 0 ? (
        <h3>No Orders Found</h3>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>Order ID: {order._id}</h3>
            <p>User: {order.user?.name}</p>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.totalPrice}</p>

            <h4>Items:</h4>
            {order.items.map((item, index) => (
              <div key={index}>
                {item.product?.title} × {item.quantity}
              </div>
            ))}

            <div style={{ marginTop: "10px" }}>
              <button onClick={() => updateStatus(order._id, "confirmed")}>
                Confirm ✅
              </button>{" "}

              <button onClick={() => updateStatus(order._id, "packed")}>
                Pack 📦
              </button>{" "}

              <button onClick={() => updateStatus(order._id, "shipped")}>
                Ship 🚚
              </button>{" "}

              <button onClick={() => updateStatus(order._id, "delivered")}>
                Deliver 🎉
              </button>{" "}

              <button onClick={() => updateStatus(order._id, "cancelled")}>
                Cancel ❌
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}