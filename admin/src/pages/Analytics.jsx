import React, { useEffect, useState, useCallback } from 'react';
import RevenueFunnel from '../components/analytics/RevenueFunnel';
import ConversionChart from '../components/analytics/ConversionChart';
import GrowthComparison from '../components/analytics/GrowthComparison';
import SalesHeatmap from '../components/analytics/SalesHeatmap';
import CustomerAnalytics from '../components/analytics/CustomerAnalytics';
import ProductAnalytics from '../components/analytics/ProductAnalytics';
import StatCard from '../components/ui/StatCard';
import DateRangePicker from '../components/DateRangePicker';
import ExportButton from '../components/ExportButton';
import { adminAPI } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Package,
  Activity,
  DollarSign,
  ShoppingCart,
  Percent,
  RefreshCw,
  AlertCircle,
  Crown
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [data, setData] = useState({
    totalRevenue: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    clv: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    funnel: [],
    heatmap: [],
    customers: {},
    products: {},
    recentOrders: []
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel data fetching with proper error handling
      const [analyticsRes, revenueRes, conversionRes, customerRes, productRes] = await Promise.allSettled([
        adminAPI.getAnalytics?.({ dateRange }) || Promise.resolve({ data: {} }),
        adminAPI.getRevenueData?.({ dateRange }) || Promise.resolve({ data: {} }),
        adminAPI.getConversionData?.({ dateRange }) || Promise.resolve({ data: {} }),
        adminAPI.getAnalytics?.({ type: 'customers' }) || Promise.resolve({ data: {} }),
        adminAPI.getAnalytics?.({ type: 'products' }) || Promise.resolve({ data: {} }),
      ]);
      
      // Safe extraction with fallbacks
      const getData = (result, fallback = {}) => {
        if (result.status === 'fulfilled') {
          return result.value?.data?.data || result.value?.data || {};
        }

        return fallback;
      };

      const analytics = getData(analyticsRes);
      const revenue = getData(revenueRes, { revenue: [] });
      const conversion = getData(conversionRes, { funnel: [] });
      const customerData = getData(customerRes, {});
      const productData = getData(productRes, {});

      setData({
        ...analytics,
        ...revenue,
        ...conversion,
        funnel: revenue.revenue || analytics.funnel || [],
        heatmap: analytics.heatmap || [],
        customers: customerData,
        products: productData,
        totalRevenue: analytics.totalRevenue || 0,
        conversionRate: analytics.conversionRate || 0,
        avgOrderValue: analytics.avgOrderValue || 0,
        clv: analytics.clv || 0,
        todayRevenue: analytics.todayRevenue || 0,
        weeklyRevenue: analytics.weeklyRevenue || 0,
        monthlyRevenue: analytics.monthlyRevenue || 0,
        growthRate: analytics.growthRate || 0,
      });
    } catch (err) {

      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const handleRetry = () => {
    loadAnalytics();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={data.totalRevenue || 0} 
          prefix="₹" 
          color="gold" 
          icon={DollarSign}
          trend={data.growthRate}
          trendLabel="vs previous period"
        />
        <StatCard 
          title="Conversion Rate" 
          value={data.conversionRate || 0} 
          suffix="%" 
          color="emerald" 
          icon={Percent}
        />
        <StatCard 
          title="Avg Order Value" 
          value={data.avgOrderValue || 0} 
          prefix="₹" 
          color="cyan" 
          icon={ShoppingCart}
        />
        <StatCard 
          title="Customer LTV" 
          value={data.clv || 0} 
          prefix="₹" 
          color="violet" 
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueFunnel data={data.funnel || data.conversion || []} />
        <ConversionChart data={data.conversion || []} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GrowthComparison data={[
          { period: 'Today', current: data.todayRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'emerald' },
          { period: 'This Week', current: data.weeklyRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'blue' },
          { period: 'This Month', current: data.monthlyRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'gold' },
        ]} />
        <SalesHeatmap data={data.heatmap || []} />
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today" value={data.todayRevenue || 0} prefix="₹" color="emerald" icon={DollarSign} trend={data.growthRate} trendLabel="vs yesterday" delay={0} />
        <StatCard title="This Week" value={data.weeklyRevenue || 0} prefix="₹" color="blue" icon={TrendingUp} trend={data.growthRate} trendLabel="vs last week" delay={100} />
        <StatCard title="This Month" value={data.monthlyRevenue || 0} prefix="₹" color="gold" icon={DollarSign} trend={data.growthRate} trendLabel="vs last month" delay={200} />
        <StatCard title="Growth Rate" value={data.growthRate || 0} suffix="%" color="violet" icon={Activity} delay={300} />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueFunnel data={data.funnel || []} />
        <GrowthComparison data={[
          { period: 'Today', current: data.todayRevenue || 0, previous: 0, change: data.growthRate || 0, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'emerald' },
          { period: 'This Week', current: data.weeklyRevenue || 0, previous: 0, change: (data.growthRate || 0) * 0.8, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'blue' },
          { period: 'This Month', current: data.monthlyRevenue || 0, previous: 0, change: (data.growthRate || 0) * 0.6, trend: (data.growthRate || 0) >= 0 ? 'up' : 'down', color: 'gold' },
        ]} />
      </div>
    </div>
  );

  const renderCustomers = () => <CustomerAnalytics data={data.customers || {}} />;
  const renderProducts = () => <ProductAnalytics data={data.products || {}} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'revenue': return renderRevenue();
      case 'customers': return renderCustomers();
      case 'products': return renderProducts();
      default: return renderOverview();
    }
  };

  // Loading skeleton
  if (loading && !data.totalRevenue) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 md:p-8 rounded-3xl animate-pulse">
          <div className="h-10 w-64 bg-white/10 rounded mb-4" />
          <div className="h-6 w-96 bg-white/5 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-4" />
              <div className="h-10 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl h-80 animate-pulse" />
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
            <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-white via-luxury-text to-gold-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-luxury-dim mt-2">
              Deep insights into your Nayamo jewellery business
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Navigation */}
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all group relative ${
                      activeTab === tab.id
                        ? 'bg-gold-gradient text-black shadow-gold-sm font-semibold'
                        : 'text-luxury-dim hover:text-luxury-text hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            
            <ExportButton data={data.funnel || []} />
            
            <button 
              onClick={handleRetry}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-luxury-dim hover:text-luxury-text transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}
