import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Lightbulb, Brain, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const KeyInsights = ({ stats = {} }) => {
  const insights = [
    {
      icon: TrendingUp,
      title: `Revenue up ${(stats.growthRate || 12).toFixed(1)}%`,
      description: 'Strong performance from repeat customers this period.'
    },
    {
      icon: Lightbulb,
      title: `Low stock: ${stats.lowStockProducts || 0} items`,
      description: 'Prioritize restocking top-selling categories.'
    },
    {
      icon: TrendingUp,
      title: `${stats.pendingOrders || 0} orders pending`,
      description: 'Optimize fulfillment for faster delivery times.'
    }
  ];

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-8 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-8 flex items-center gap-3">
        <Lightbulb size={24} className="text-gold-500" />
        Key Insights
      </h3>
      <div className="space-y-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="group p-6 rounded-xl border border-neutral-200/30 dark:border-neutral-800/50 hover:border-gold-400/50 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-white/70 dark:hover:bg-neutral-700/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-700/50 border border-neutral-200/30 w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-neutral-700 dark:text-neutral-300 group-hover:text-gold-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2 group-hover:text-gold-600">
                    {insight.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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

export default KeyInsights;

KeyInsights.propTypes = {
  stats: PropTypes.object
};
