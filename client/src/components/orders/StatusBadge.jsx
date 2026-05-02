import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  RotateCcw,
  CircleDot
} from "lucide-react";

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: "text-amber-400", 
    bg: "bg-amber-400/10", 
    border: "border-amber-400/20",
    label: "Pending" 
  },
  confirmed: { 
    icon: CheckCircle, 
    color: "text-blue-400", 
    bg: "bg-blue-400/10", 
    border: "border-blue-400/20",
    label: "Confirmed" 
  },
  ready_to_ship: { 
    icon: Package, 
    color: "text-purple-400", 
    bg: "bg-purple-400/10", 
    border: "border-purple-400/20",
    label: "Ready to Ship" 
  },
  pickup_requested: { 
    icon: Truck, 
    color: "text-indigo-400", 
    bg: "bg-indigo-400/10", 
    border: "border-indigo-400/20",
    label: "Pickup Requested" 
  },
  in_transit: { 
    icon: Truck, 
    color: "text-cyan-400", 
    bg: "bg-cyan-400/10", 
    border: "border-cyan-400/20",
    label: "In Transit" 
  },
  out_for_delivery: { 
    icon: Truck, 
    color: "text-teal-400", 
    bg: "bg-teal-400/10", 
    border: "border-teal-400/20",
    label: "Out for Delivery" 
  },
  delivered: { 
    icon: CheckCircle, 
    color: "text-green-400", 
    bg: "bg-green-400/10", 
    border: "border-green-400/20",
    label: "Delivered" 
  },
  cancelled: { 
    icon: XCircle, 
    color: "text-red-400", 
    bg: "bg-red-400/10", 
    border: "border-red-400/20",
    label: "Cancelled" 
  },
  returned: { 
    icon: RotateCcw, 
    color: "text-orange-400", 
    bg: "bg-orange-400/10", 
    border: "border-orange-400/20",
    label: "Returned" 
  },
  return_requested: { 
    icon: RotateCcw, 
    color: "text-rose-400", 
    bg: "bg-rose-400/10", 
    border: "border-rose-400/20",
    label: "Return Requested" 
  },
  rto: { 
    icon: CircleDot, 
    color: "text-gray-400", 
    bg: "bg-gray-400/10", 
    border: "border-gray-400/20",
    label: "RTO" 
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full ${config.bg} border ${config.border}`}
    >
      <StatusIcon className={`${iconSizes[size]} ${config.color}`} />
      <span className={`font-semibold ${config.color}`}>
        {config.label}
      </span>
    </motion.div>
  );
}
