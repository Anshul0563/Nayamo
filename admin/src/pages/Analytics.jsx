import React, { useEffect, useState, useCallback } from 'react';
import RevenueFunnel from '../components/analytics/RevenueFunnel';
import ConversionChart from '../components/analytics/ConversionChart';
import GrowthComparison from '../components/analytics/GrowthComparison';
import SalesHeatmap from '../components/analytics/SalesHeatmap';
import StatCard from '../components/ui/StatCard';
import DateRangePicker from '../components/DateRangePicker';
import ExportButton from '../components/ExportButton';
import { adminAPI } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  CalendarDays,
  DollarSign,
  Users,
  ShoppingCart,
  Percent
} from 'lucide-react';


const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'acquisition', label: 'Acquisition', icon: Activity },
  { id: 'behavior', label: 'Behavior', icon: CalendarDays },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, revenueRes, conversionRes] = await Promise.all([
        adminAPI.getAnalytics?.() || Promise.resolve({ data: {} }),
        adminAPI.getRevenueData?.() || Promise.resolve({ data: {} }),
        adminAPI.getConversionData?.() || Promise.resolve({ data: {} }),
      ]);
      
      const analytics = analyticsRes.data.data || analyticsRes.data || {};
      setData({
        ...analytics,
        revenue: revenueRes.data.data || analytics.revenue || [],
        conversion: conversionRes.data.data || analytics.funnel || [],
      });
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const renderContent = () => {
    switch (activeTab) {
case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Revenue" value={data.totalRevenue || 0} prefix="₹" color="gold" icon={DollarSign} />
            <StatCard title="Conversion Rate" value={data.conversionRate || 0} suffix="%" color="emerald" icon={Percent} />
            <StatCard title="Avg Order Value" value={data.avgOrderValue || 0} prefix="₹" color="cyan" icon={ShoppingCart} />
            <StatCard title="Customer Lifetime Value" value={data.clv || 0} prefix="₹" color="violet" icon={Users} />
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            <RevenueFunnel data={data.funnel || data.conversion || []} />
            <GrowthComparison data={[
              { period: 'Today', current: data.todayRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'emerald' },
              { period: 'This Week', current: data.weeklyRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'blue' },
              { period: 'This Month', current: data.monthlyRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'gold' },
            ]} />
          </div>
        );

      case 'acquisition':
        return (
          <div className="space-y-6">
            <ConversionChart data={data.conversion || []} />
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <SalesHeatmap data={data.heatmap || []} />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="shimmer h-8 w-64 rounded bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="shimmer h-4 w-24 rounded bg-white/5 mb-4" />
              <div className="shimmer h-10 w-20 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-text">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-luxury-dim mt-2">
              Deep insights into your Nayamo jewellery business performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all group relative ${
                      activeTab === tab.id
                        ? 'bg-gold-gradient text-black shadow-gold-sm font-semibold'
                        : 'text-luxury-dim hover:text-luxury-text hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <DateRangePicker />
            
            <div className="flex gap-2">
              <ExportButton data={data.revenue || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {renderContent()}
      </div>
    </div>
  );
}
