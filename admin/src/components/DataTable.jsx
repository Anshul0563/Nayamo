import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { SkeletonRow } from './ui/Skeleton';

const DataTable = ({
  columns,
  data,
  loadMore,
  hasMore,
  loading,
  total,
  filters,
  onSearch,
  onFilter,
  enableSelection = false,
  selected,
  onSelect,
  exportData,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const observer = useRef();
  const lastRowRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
  };

  const filteredData = data.filter(row => {
    // Simple search across all columns
    return columns.some(col => 
      row[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={`glass-card rounded-3xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-luxury-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h3 className="text-xl font-semibold text-luxury-text">Data Table</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-dim" />
            <input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search records..."
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-luxury-border w-64 text-sm focus:border-gold-500/50"
            />
          </div>
          {filters && (
            <div className="relative group">
              <button className="luxury-btn luxury-btn-secondary px-4 py-2">
                <Filter size={16} />
              </button>
              {/* Dropdown filters */}
            </div>
          )}
          {exportData && (
            <button onClick={exportData} className="luxury-btn luxury-btn-secondary px-4 py-2 flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          )}
          <span className="text-sm text-luxury-dim lg:ml-auto">{filteredData.length} of {total} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-luxury-border">
              {enableSelection && <th className="p-4 w-12"><input type="checkbox" className="w-4 h-4 rounded text-gold-500" /></th>}
              {columns.map(col => (
                <th key={col.key} className="p-4 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({length: 10}).map((_, i) => <SkeletonRow key={i} />)}
              </>
            )}
            {filteredData.map((row, index) => (
              <tr 
                key={row.id || index} 
                ref={hasMore && index === filteredData.length - 1 ? lastRowRef : null}
                className="border-b border-luxury-border/50 hover:bg-white/[0.02] transition-colors group"
              >
                {enableSelection && (
                  <td className="p-4">
                    <input type="checkbox" checked={selected?.includes(row.id)} onChange={() => onSelect?.(row.id)} className="w-4 h-4 rounded text-gold-500" />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="p-4 text-luxury-text">
                    {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && hasMore && (
        <div className="p-6 border-t border-luxury-border bg-white/[0.01] text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-400" />
          <p className="text-luxury-dim mt-2 text-sm">Loading more...</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;

