import { useEffect, useState } from "react";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders 📦</h1>

      {orders.length === 0 ? (
        <h3>No Orders Found</h3>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              background: "#111",
              color: "white",
              padding: 20,
              marginTop: 15,
              borderRadius: 10
            }}
          >
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.totalPrice}</p>
            <p>Payment: {order.paymentMethod}</p>
            <p>Address: {order.address}</p>

            <h4>Items:</h4>

            {order.items.map((item, i) => (
              <div key={i}>
                {item.product?.title} × {item.quantity}
              </div>
            ))}

            {["pending", "confirmed"].includes(order.status) && (
              <button
                onClick={() => cancelOrder(order._id)}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  border: "none",
                  background: "red",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}