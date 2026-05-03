import React, { useState, useEffect } from 'react';
import { Lightbulb, Brain, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);

  // Mock AI insights - rotate every 30s
  useEffect(() => {
    const mockInsights = [
      {
        icon: TrendingUp,
        title: 'Revenue Growth Detected',
        description: '15% increase in high-value orders from returning customers. Consider loyalty program expansion.',
        color: 'emerald',
        type: 'positive'
      },
      {
        icon: AlertCircle,
        title: 'Cart Abandonment Spike',
        description: '23% increase in abandoned carts during checkout. Optimize payment flow and add exit-intent offers.',
        color: 'orange',
        type: 'warning'
      },
      {
        icon: Brain,
        title: 'Top Performer Identified',
        description: "Product 'Premium Silk Saree' accounts for 42% revenue. Create lookalike products and bundle offers.",
        color: 'gold',
        type: 'insight'
      },
      {
        icon: TrendingDown,
        title: 'Inventory Alert',
        description: '12 SKUs below safety stock. Prioritize restock for high-demand categories: Ethnic Wear, Jewelry.',
        color: 'rose',
        type: 'alert'
      },
      {
        icon: Lightbulb,
        title: 'Conversion Opportunity',
        description: 'Mobile users converting 18% lower. Implement AMP pages and faster checkout for mobile.',
        color: 'violet',
        type: 'opportunity'
      }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      setInsights(mockInsights.slice(currentIndex, currentIndex + 2));
      currentIndex = (currentIndex + 2) % mockInsights.length;
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 rounded-3xl border-gold-animated shadow-gold-lg backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Business Insights
          </h3>
          <p className="text-sm text-luxury-dim">Real-time recommendations powered by your data</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="group p-4 rounded-2xl border border-white/10 hover:border-gold-500/30 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all backdrop-blur-sm cursor-pointer hover:shadow-gold-md">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${insight.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  insight.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20' :
                  insight.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20' :
                  'bg-gold-500/10 border-gold-500/20'} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 text-${insight.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-luxury-text group-hover:text-gold-400 transition-colors mb-1">
                    {insight.title}
                  </p>
                  <p className="text-sm text-luxury-dim leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIInsights;
