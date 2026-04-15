
import { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("cod");
  const [loading, setLoading] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const api = axios.create({
    baseURL:
      "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const placeCODOrder =
    async () => {
      try {
        setLoading(true);

        await api.post("/orders", {
          address,
          phone,
          paymentMethod: "cod",
        });

        alert("Order placed successfully");
        window.location.href =
          "/my-orders";
      } catch {
        alert("Order failed");
      } finally {
        setLoading(false);
      }
    };

  const placeOnlineOrder =
    async () => {
      try {
        setLoading(true);

        // 1. Create payment order
        const payRes =
          await api.post(
            "/payment/create-order",
            {
              amount:
                cart.totalPrice,
            }
          );

        const razorOrder =
          payRes.data.order;

        // 2. Create DB order first
        const orderRes =
          await api.post("/orders", {
            address,
            phone,
            paymentMethod:
              "online",
          });

        const dbOrder =
          orderRes.data;

        // 3. Fake payment success
        await api.post(
          "/payment/verify",
          {
            orderId:
              dbOrder._id,
            razorpayPaymentId:
              "pay_demo_" +
              Date.now(),
            razorpaySignature:
              "demo_signature",
          }
        );

        alert(
          "Online Payment Success"
        );

        window.location.href =
          "/my-orders";
      } catch (error) {
        console.log(error);
        alert(
          "Payment failed"
        );
      } finally {
        setLoading(false);
      }
    };

  const submitHandler =
    async () => {
      if (
        !address.trim() ||
        !phone.trim()
      ) {
        alert(
          "Fill address & phone"
        );
        return;
      }

      if (
        paymentMethod === "cod"
      ) {
        placeCODOrder();
      } else {
        placeOnlineOrder();
      }
    };

  if (!cart) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">
            Checkout
          </h1>

          <div className="mt-6 space-y-4">
            <textarea
              rows="5"
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              placeholder="Full Address"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
            />

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Phone Number"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
            />

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none"
            >
              <option value="cod">
                Cash on Delivery
              </option>

              <option value="online">
                Pay Online
              </option>
            </select>

            <button
              onClick={
                submitHandler
              }
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-lg"
            >
              {loading
                ? "Processing..."
                : paymentMethod ===
                  "cod"
                ? "Place Order"
                : "Pay Now"}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4">
            {cart.items.map(
              (item) => (
                <div
                  key={
                    item._id
                  }
                  className="flex justify-between border-b border-white/10 pb-3"
                >
                  <div>
                    <p className="font-semibold">
                      {
                        item
                          .product
                          .title
                      }
                    </p>

                    <p className="text-zinc-400 text-sm">
                      Qty:{" "}
                      {
                        item.quantity
                      }
                    </p>
                  </div>

                  <p>
                    ₹
                    {item.product
                      .price *
                      item.quantity}
                  </p>
                </div>
              )
            )}

            <div className="pt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>
                ₹
                {
                  cart.totalPrice
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}