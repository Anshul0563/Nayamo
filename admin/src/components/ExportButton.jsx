import React from 'react';
import { Download, FileText, Check, AlertCircle } from 'lucide-react';

export default function ExportButton({ filename = 'nayamo-analytics', data = [], loading = false, onExport }) {
  const handleExport = () => {
    if (!data.length) {
      alert('No data to export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    onExport?.();
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || !data.length}
      className="luxury-btn luxury-btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:shadow-gold-sm group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : data.length ? (
        <>
          <Download size={18} />
          Export CSV ({data.length} rows)
        </>
      ) : (
        <>
          <AlertCircle size={18} className="text-rose-400" />
          No data
        </>
      )}
    </button>
  );
}

