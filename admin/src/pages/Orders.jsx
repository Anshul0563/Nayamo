import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    axios.get("http://localhost:5000/api/admin/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => setOrders(res.data.orders));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = (id, status) => {
    axios.put(`http://localhost:5000/api/admin/orders/${id}`, {
      status
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(() => fetchOrders());
  };

  return (
    <div>
      <h1>Orders 📦</h1>

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid gray", margin: 10 }}>
          
          <h3>User: {order.user?.name}</h3>
          <p>Total: ₹{order.totalPrice}</p>
          <p>Status: {order.status}</p>

          <button onClick={() => updateStatus(order._id, "confirmed")}>
            Accept ✅
          </button>

          <button onClick={() => updateStatus(order._id, "cancelled")}>
            Cancel ❌
          </button>

        </div>
      ))}
    </div>
  );
}