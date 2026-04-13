import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data.data);
      } catch (err) {
        console.log(err);
        console.log(err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "200px",
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />

            <h3>{product.title}</h3>
            <p>₹{product.price}</p>

            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
