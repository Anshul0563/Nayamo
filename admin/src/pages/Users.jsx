import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { adminAPI } from '../services/api';
import { Search, Loader2, Filter, Users as UsersIcon, UserCheck, UserX, Crown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { SkeletonTable } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import ExportButton from '../components/ExportButton';

const ROLES = ['customer', 'admin'];
const STATUSES = ['active', 'banned'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [updating, setUpdating] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearch = useMemo(() => search, [search]);

  const loadUsers = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: 20, 
        search: debouncedSearch || undefined, 
        role: roleFilter || undefined, 
        isActive: statusFilter ? statusFilter === 'active' : undefined
      };
      const res = await adminAPI.getUsers(params);
      const result = res.data;
      const userList = result.users || result.data || [];
      setUsers(userList);
      setPage(result.pagination?.currentPage || 1);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalItems(result.pagination?.totalItems || userList.length);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const toggleUser = async (userId, field, value) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      await adminAPI.updateUser(userId, { [field]: value });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, [field]: value } : u));
    } catch (error) {
      console.error('Update user error:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const bulkUpdate = async () => {
    if (!bulkAction || selected.length === 0) return;
    
    try {
      for (const userId of selected) {
        await adminAPI.updateUser(userId, { isActive: bulkAction === 'active' });
      }
      setUsers(prev => prev.map(u => selected.includes(u._id) ? { ...u, isActive: bulkAction === 'active' } : u));
      setSelected([]);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  };

  const bulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Deactivate ${selected.length} selected users?`)) return;

    try {
      for (const userId of selected) {
        await adminAPI.deleteUser(userId);
      }
      await loadUsers(page);
      setSelected([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map(u => u._id));
    }
  };

  const exportData = useMemo(() => {
    return users.map(user => ({
      id: user._id,
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      role: user.role || 'customer',
      status: user.isActive ? 'active' : 'banned',
      lastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString('en-IN') : 'Never',
    }));
  }, [users]);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-luxury-text mb-2">Users</h1>
        <p className="text-luxury-dim">Manage your customer and admin accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          value={totalItems} 
          icon={<UsersIcon size={24} />}
          trend="up" 
        />
        <StatCard 
          title="Active" 
          value={users.filter(u => u.isActive).length} 
          icon={<UserCheck size={24} />}
          trend="up" 
        />
        <StatCard 
          title="Banned" 
          value={users.filter(u => !u.isActive).length} 
          icon={<UserX size={24} />}
          trend="down" 
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-dim" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-luxury-border text-luxury-text focus:border-gold-500/50 transition-all outline-none"
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-luxury-border text-luxury-text focus:border-gold-500/50 transition-all outline-none"
          >
            <option value="">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role.toUpperCase()}</option>
            ))}
          </select>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-luxury-border text-luxury-text focus:border-gold-500/50 transition-all outline-none"
          >
            <option value="">All Status</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>

          <ExportButton filename="users" data={exportData} />
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="rounded-2xl border border-luxury-border bg-black/[0.04] p-4 flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm font-medium text-luxury-text">{selected.length} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-4 py-2 rounded-xl bg-black/[0.06] border border-luxury-border text-sm outline-none text-luxury-text"
          >
            <option value="">Bulk Update Status</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={bulkUpdate}
            disabled={!bulkAction}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm text-white disabled:opacity-50 transition"
          >
            Apply
          </button>
          <button
            onClick={bulkDelete}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm text-white flex items-center gap-2 transition"
          >
            <Trash2 size={14} />
            Deactivate
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-luxury-dim hover:text-luxury-text ml-auto underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-3xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-border">
                <th className="p-6 w-12">
                  <input 
                    type="checkbox" 
                    checked={selected.length === users.length && users.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded text-gold-500 bg-white/5 border-luxury-border"
                  />
                </th>
                <th className="p-6 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">User</th>
                <th className="p-6 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">Role</th>
                <th className="p-6 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">Status</th>
                <th className="p-6 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">Last Active</th>
                <th className="p-6 text-left font-semibold text-luxury-text text-sm uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable rows={5} cols={6} />
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-luxury-border/50 table-row nav-link-hover transition-colors">
                    <td className="p-6">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                        className="w-4 h-4 rounded text-gold-500 bg-white/5 border-luxury-border"
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
                          <Crown size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-luxury-text">{user.name}</p>
                          <p className="text-sm text-luxury-dim">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-gold-500/10 text-gold-400' 
                          : 'bg-white/10 text-luxury-dim'
                      }`}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => toggleUser(user._id, 'isActive', !user.isActive)}
                        disabled={updating[user._id]}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {updating[user._id] ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          user.isActive ? 'Active' : 'Banned'
                        )}
                      </button>
                    </td>
                    <td className="p-6 text-sm text-luxury-dim">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <select 
                          value={user.role}
                          onChange={(e) => toggleUser(user._id, 'role', e.target.value)}
                          disabled={updating[user._id]}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-luxury-border text-xs focus:border-gold-500/50 transition-all text-luxury-text outline-none"
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>{role.toUpperCase()}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => toggleUser(user._id, 'status', 'banned')}
                          className="p-1.5 text-luxury-dim hover:text-luxury-text hover:bg-white/5 rounded-lg transition-all"
                          title="Deactivate user"
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-luxury-dim">
          <button 
            onClick={() => loadUsers(page - 1)}
            disabled={page <= 1}
            className="luxury-btn luxury-btn-secondary px-4 py-2 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-luxury-text">Page {page} of {totalPages}</span>
          <button 
            onClick={() => loadUsers(page + 1)}
            disabled={page >= totalPages}
            className="luxury-btn luxury-btn-secondary px-4 py-2 disabled:opacity-40 flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
