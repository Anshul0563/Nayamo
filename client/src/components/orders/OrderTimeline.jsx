import React from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  CheckCircle, 
  Package, 
  Truck, 
  Home,
  Check
} from "lucide-react";

const orderSteps = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "ready_to_ship", label: "Ready to Ship", icon: Package },
  { key: "in_transit", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTimeline({ status }) {
  // Find current step index
  const currentIndex = orderSteps.findIndex((step) => step.key === status);
  
  // Special statuses that should show completion
  const completedStatuses = ["cancelled", "returned", "return_requested", "rto"];
  const isCompleted = completedStatuses.includes(status);
  
  // Get step number (0-based index)
  const getStepNumber = (index) => {
    if (isCompleted) {
      if (status === "cancelled" || status === "rto") return 0;
      if (status === "returned" || status === "return_requested") return orderSteps.length - 1;
    }
    return index;
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#2A2A2E] hidden md:block">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(getStepNumber(currentIndex) / (orderSteps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#D4A853] to-[#F0D78C]"
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between md:grid md:grid-cols-6 gap-4">
        {orderSteps.map((step, index) => {
          const StepIcon = step.icon;
          const stepNumber = getStepNumber(index);
          const isActive = index <= currentIndex && !isCompleted;
          const isCurrent = index === currentIndex && !isCompleted;
          const canShow = index <= currentIndex || index === 0;

          if (!canShow && !isCompleted) return null;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 relative z-10"
            >
              {/* Icon container */}
              <div 
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${isActive || isCurrent 
                    ? "bg-gradient-to-br from-[#D4A853] to-[#C9963B] shadow-lg shadow-[#D4A853]/30" 
                    : isCompleted && index === 0
                      ? "bg-red-500/20 border-2 border-red-500/50"
                      : "bg-[#1E1E24] border-2 border-[#2A2A2E]"
                  }
                `}
              >
                {isActive || isCurrent ? (
                  <StepIcon className="w-5 h-5 md:w-6 md:h-6 text-black" />
                ) : isCompleted && index === 0 ? (
                  <StepIcon className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                ) : (
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#3A3A40]" />
                )}
              </div>

              {/* Label */}
              <div className="text-center hidden md:block">
                <p 
                  className={`
                    text-xs md:text-sm font-medium
                    ${isActive || isCurrent 
                      ? "text-[#D4A853]" 
                      : isCompleted && index === 0
                        ? "text-red-400"
                        : "text-[#71717A]"
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>

              {/* Mobile: Show only current step */}
              {isCurrent && (
                <p className="md:hidden text-xs text-[#D4A853] font-medium">
                  {step.label}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Status indicator for cancelled/returned */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            mt-4 p-3 rounded-xl text-center
            ${status === "cancelled" || status === "rto"
              ? "bg-red-500/10 border border-red-500/20"
              : status === "returned" || status === "return_requested"
                ? "bg-orange-500/10 border border-orange-500/20"
                : "bg-green-500/10 border border-green-500/20"
            }
          `}
        >
          <p className={`
            text-sm font-medium
            ${status === "cancelled" || status === "rto" ? "text-red-400" : "text-orange-400"}
          `}>
            {status === "cancelled" && "Order has been cancelled"}
            {status === "rto" && "Returned to Origin"}
            {status === "return_requested" && "Return request submitted"}
            {status === "returned" && "Order has been returned"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
