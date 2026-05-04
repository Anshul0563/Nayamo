import { useState, useEffect } from "react";
import { orderAPI } from "@/services/api";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { Link } from "react-router-dom";
import { Clock, MapPin, Package } from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="py-12">
      <div className="nayamo-container">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-2">
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <EmptyState 
            title="No Orders"
            subtitle="Your orders will appear here"
            action={<Link to="/shop" className="nayamo-btn-primary mt-4 inline-block">Start Shopping</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="nayamo-glass p-8 rounded-3xl border group hover:border-nayamo-gold/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div>
                      <h3 className="font-semibold text-nayamo-text-primary">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-nayamo-text-muted text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-nayamo-bg-card rounded-2xl">
                    <Clock className="w-5 h-5 text-nayamo-text-muted" />
                    <div>
                      <p className="text-xs text-nayamo-text-tertiary uppercase tracking-wider">Delivery</p>
                      <p className="font-semibold text-nayamo-text-primary">3-5 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-nayamo-bg-card rounded-2xl">
                    <Package className="w-5 h-5 text-nayamo-text-muted" />
                    <div>
                      <p className="text-xs text-nayamo-text-tertiary uppercase tracking-wider">Items</p>
                      <p className="font-semibold text-nayamo-text-primary">{order.items.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-nayamo-bg-card rounded-2xl">
                    <div className="w-5 h-5 bg-nayamo-gold rounded-full" />
                    <div>
                      <p className="text-xs text-nayamo-text-tertiary uppercase tracking-wider">Total</p>
                      <p className="font-bold text-2xl text-nayamo-gold">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-nayamo-bg-card rounded-2xl">
                      <img 
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-nayamo-text-primary line-clamp-1">
                          {item.product.title}
                        </h4>
                        <p className="text-sm text-nayamo-text-muted">
                          Qty: {item.quantity} • ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-nayamo-border-light">
                  <Link 
                    to={`/orders/${order._id}`}
                    className="flex-1 nayamo-btn-primary justify-center py-4 text-lg"
                  >
                    View Details
                  </Link>
                  {order.status === "delivered" && (
                    <Link 
                      to={`/track-order`}
                      className="flex-1 bg-nayamo-bg-card border border-nayamo-border-light rounded-2xl py-4 text-lg hover:border-nayamo-gold/50 transition-all justify-center"
                    >
                      Track Order
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

