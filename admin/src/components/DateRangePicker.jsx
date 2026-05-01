import React, { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from '@heroicons/react/24/outline';

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const presets = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPresetLabel = () => {
    if (!value) return 'Last 30 days';
    if (typeof value === 'string') {
      const preset = presets.find(p => p.value === value);
      return preset ? preset.label : 'Last 30 days';
    }
    // If it's an array of dates
    if (Array.isArray(value)) {
      return value[0] && value[1] ? formatDate(value[0]) + ' - ' + formatDate(value[1]) : 'Last 30 days';
    }
    return 'Last 30 days';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 border border-luxury-border bg-white/5 rounded-xl hover:bg-white/10 transition-all text-luxury-text hover:border-gold-500/50 group"
      >
        <CalendarIcon className="w-5 h-5 text-gold-400" />
        <span className="font-medium">
          {getPresetLabel()}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-luxury-card border border-luxury-border rounded-2xl shadow-elevated z-50 p-4">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  // Handle preset logic
                  setOpen(false);
                  onChange?.(preset.value);
                }}
                className="p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="font-medium text-sm">{preset.label}</div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-luxury-border my-3" />

          {/* Quick actions */}
          <div className="flex items-center justify-between text-xs text-luxury-dim mb-4">
            <span>Custom Range</span>
            <button className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-xs font-medium">
              📅 Calendar
            </button>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <span className="text-sm text-luxury-dim">Days selected:</span>
            <span className="font-bold text-gold-400">30</span>
          </div>
        </div>
      )}
    </div>
  );
}

