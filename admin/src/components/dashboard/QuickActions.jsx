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
    { icon: Plus, label: 'Add Product', to: '/admin/add-product' },
    { icon: ShoppingCart, label: 'View Orders', to: '/admin/orders' },
    { icon: Users, label: 'Manage Users', to: '/admin/users' },
    { icon: Package, label: 'Inventory', to: '/admin/inventory' },
    { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ];

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-8 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-8 flex items-center gap-3">
        <BarChart3 size={24} className="text-gold-500" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group relative p-6 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:border-gold-400/50 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-white/70 dark:hover:bg-neutral-700/50 transition-all duration-300 flex flex-col items-center gap-3 text-center hover:shadow-md"
            >
              <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-700/50 border border-neutral-200/30 dark:border-neutral-600/50 w-12 h-12 flex items-center justify-center group-hover:bg-gold-50 dark:group-hover:bg-gold-500/10">
                <Icon size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-gold-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-gold-600 transition-colors leading-tight">
                {action.label}
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-400 absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all ml-auto group-hover:text-gold-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
