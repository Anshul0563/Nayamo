
import { useEffect, useState } from "react";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No Orders Yet
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Order #{order._id.slice(-6)}
                    </h2>

                    <p className="text-zinc-400 mt-2">
                      Status:{" "}
                      <span className="capitalize text-white">
                        {order.status}
                      </span>
                    </p>

                    <p className="text-zinc-400 mt-1">
                      Payment:{" "}
                      <span
                        className={`${
                          order.paymentStatus === "paid"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </p>

                    {order.isPaid && (
                      <div className="mt-3 inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                        Paid ✅
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-400">
                      ₹{order.totalPrice}
                    </p>

                    <p className="text-zinc-400 mt-2">
                      {order.items.length} Items
                    </p>

                    <p className="text-zinc-500 text-sm mt-2">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-zinc-400 mb-2">
                    Delivery Address
                  </p>

                  <p className="text-white">
                    {order.address}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-zinc-400 mb-3">
                    Items
                  </p>

                  <div className="grid gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between bg-black/30 rounded-2xl px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product?.title}
                          </p>

                          <p className="text-zinc-500 text-sm">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ₹
                          {item.product?.price *
                            item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shiprocket?.awb && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-zinc-400">
                      Tracking ID
                    </p>

                    <p className="text-blue-400 font-semibold mt-1">
                      {order.shiprocket.awb}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}