import { useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const placeOrder = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/orders",
        {
          address,
          phone,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Order placed successfully 💎");
      window.location.href = "/orders";

    } catch (err) {
      alert(err.response?.data?.message || "Order failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h1>Checkout 📦</h1>

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      >
        <option value="cod">Cash on Delivery</option>
        <option value="online">Online Payment</option>
      </select>

      <button
        onClick={placeOrder}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          background: "#00b894",
          color: "#fff",
          border: "none",
        }}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}