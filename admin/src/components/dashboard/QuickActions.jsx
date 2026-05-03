import React from 'react';
import { 
  Plus, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { 
      icon: Plus, 
      label: 'Add Product', 
      to: '/admin/add-product',
      color: 'emerald'
    },
    { 
      icon: ShoppingCart, 
      label: 'View Orders', 
      to: '/admin/orders',
      color: 'gold'
    },
    { 
      icon: Users, 
      label: 'Manage Users', 
      to: '/admin/users',
      color: 'cyan'
    },
    { 
      icon: Package, 
      label: 'Inventory', 
      to: '/admin/inventory',
      color: 'violet'
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      to: '/admin/analytics',
      color: 'indigo'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      to: '/admin/settings',
      color: 'slate'
    },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border-gold-animated shadow-gold-md backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-luxury-text mb-6 flex items-center gap-2">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group relative p-4 rounded-2xl border border-transparent hover:border-gold-500/30 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-gold-sm hover:scale-[1.02] flex flex-col items-center gap-3 h-24"
            >
              <div className={`p-3 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/20 group-hover:bg-${action.color}-500/20 transition-all`}>
                <Icon className={`w-5 h-5 text-${action.color}-400 group-hover:text-${action.color}-300 transition-colors`} />
              </div>
              <span className="text-sm font-medium text-luxury-text group-hover:text-gold-400 transition-colors text-center leading-tight">
                {action.label}
              </span>
              <ArrowRight className="w-4 h-4 text-luxury-dim absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all ml-auto" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
