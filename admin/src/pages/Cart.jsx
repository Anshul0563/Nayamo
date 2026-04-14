import { useEffect, useState } from "react";
import axios from "axios";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(res.data.items || []);

      let sum = 0;
      (res.data.items || []).forEach((item) => {
        sum += item.product.price * item.quantity;
      });
      setTotal(sum);

    } catch (err) {
      console.log(err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Cart 🛒</h1>

      {cart.length === 0 ? (
        <h3>Cart is empty</h3>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.product._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>{item.product.title}</h3>
              <p>₹{item.product.price}</p>
              <p>Qty: {item.quantity}</p>

              <button onClick={() => removeItem(item.product._id)}>
                Remove ❌
              </button>
            </div>
          ))}

          <h2>Total: ₹{total}</h2>

          <button onClick={()=> window.location.href="./Checkout.jsx"}>Checkout 📦</button>
        </>
      )}
    </div>
  );
}