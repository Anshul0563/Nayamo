import { X, User, MapPin, CreditCard, Package, Calendar, Truck, Phone, Mail } from "lucide-react";

const TABS = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready_to_ship: "Ready To Ship",
  pickup_requested: "Pickup Requested",
  in_transit: "In Transit",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  rto: "RTO",
};

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready_to_ship: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  pickup_requested: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  in_transit: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  out_for_delivery: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  returned: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  rto: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  refunded: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export default function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null;

  const imageUrl = (image) =>
    typeof image === "string" ? image : image?.url;

  const timeline = [
    { label: "Order Placed", date: order.createdAt, icon: Calendar },
    { label: "Status Updated", date: order.updatedAt, icon: Truck },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-xl text-sm font-medium border capitalize ${
                statusColors[order.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
              }`}
            >
              {(order.status || "").replaceAll("_", " ")}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Items */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package size={18} className="text-indigo-400" />
                Order Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {(order.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <img
                      src={imageUrl(item.product?.images?.[0]) || imageUrl(item.image)}
                      alt={item.product?.title || item.name || "Product"}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {item.product?.title || item.name || "Product"}
                      </h4>
                      <p className="text-sm text-zinc-400">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ₹{(item.quantity || 1) * (item.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <p className="text-zinc-500 text-sm">No items in this order</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Truck size={18} className="text-indigo-400" />
                Order Timeline
              </h3>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <event.icon size={14} />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-white/10 my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-white text-sm">{event.label}</p>
                      <p className="text-xs text-zinc-400">
                        {event.date
                          ? new Date(event.date).toLocaleString("en-IN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TABS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onStatusChange?.(order._id, key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      order.status === key
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-indigo-400" />
                Customer Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-zinc-400">Customer</p>
                  </div>
                </div>
                {order.user?.email && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Mail size={14} className="text-zinc-500" />
                    {order.user.email}
                  </div>
                )}
                {order.user?.phone && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Phone size={14} className="text-zinc-500" />
                    {order.user.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-400" />
                Shipping Address
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {order.address ||
                  order.shippingAddress ||
                  "No address provided"}
              </p>
            </div>

            {/* Payment Info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-400" />
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Method</span>
                  <span className="text-white capitalize">
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span
                    className={`capitalize ${
                      order.paymentStatus === "paid"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {order.paymentStatus || "pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order Total</span>
                  <span className="text-white font-semibold">
                    ₹{order.totalPrice}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Discount</span>
                    <span className="text-emerald-400">-₹{order.discount}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Shipping</span>
                    <span className="text-white">₹{order.shippingCost}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                  <span className="text-white font-semibold">Grand Total</span>
                  <span className="text-white font-bold text-lg">
                    ₹{order.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
