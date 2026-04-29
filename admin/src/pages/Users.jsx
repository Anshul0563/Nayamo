import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { adminAPI } from '../services/api';
import { Search, Shield, UserX, UserCheck, Trash2, Loader2, Filter } from 'lucide-react';
import { SkeletonTable } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';

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

  const debouncedSearch = useMemo(() => search, [search]);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 50, search: debouncedSearch || undefined, role: roleFilter || undefined, status: statusFilter || undefined };
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.users || res.data.data || []);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter]);


  useEffect(() => {
    loadUsers();
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
        await adminAPI.updateUser(userId, { status: bulkAction });
      }
      setUsers(prev => prev.map(u => selected.includes(u._id) ? { ...u, status: bulkAction } : u));
      setSelected([]);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !search || 
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    banned: users.filter(u => u.status === 'banned').length,
    admins: users.filter(u => u.role === 'admin').length,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-text">
              User Management
            </h1>
            <p className="text-lg text-luxury-dim mt-2">Manage customers and administrators with precision</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats.total} color="cyan" />
            <StatCard title="Active" value={stats.active} color="emerald" />
            <StatCard title="Banned" value={stats.banned} color="rose" />
            <StatCard title="Admins" value={stats.admins} color="gold" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dim w-5 h-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-luxury-border text-luxury-text placeholder:text-luxury-dim focus:border-gold-500/50 focus:shadow-gold-sm transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-luxury-border focus:border-gold-500/50"
            >
              <option value="">All Roles</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role.toUpperCase()}</option>
              ))}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-luxury-border focus:border-gold-500/50"
            >
              <option value="">All Status</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>

            <button className="luxury-btn luxury-btn-secondary px-6">
              <Filter size={18} />
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selected.length > 0} className="w-4 h-4 rounded text-gold-500" />
            <span className="font-medium">{selected.length} selected</span>
          </div>
          
          <select 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-luxury-border text-sm"
          >
            <option value="">Bulk Action</option>
            <option value="banned">Ban Users</option>
            <option value="active">Activate Users</option>
          </select>

          <button 
            onClick={bulkUpdate}
            className="luxury-btn luxury-btn-danger px-6 py-2"
            disabled={!bulkAction}
          >
            Apply
          </button>

          <button 
            onClick={() => setSelected([])}
            className="text-luxury-dim hover:text-luxury-text ml-auto transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <SkeletonTable rows={12} />
        ) : filteredUsers.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-luxury-dim">
              <Users size={64} className="mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-semibold mb-2">No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-border">
                  <th className="p-6 text-left">
                    <input type="checkbox" className="w-5 h-5 rounded text-gold-500" />
                  </th>
                  <th className="p-6 text-left font-semibold text-luxury-text w-12">Avatar</th>
                  <th className="p-6 text-left font-semibold text-luxury-text min-w-[200px]">Name</th>
                  <th className="p-6 text-left font-semibold text-luxury-text">Email</th>
                  <th className="p-6 text-left font-semibold text-luxury-text min-w-[100px]">Role</th>
                  <th className="p-6 text-left font-semibold text-luxury-text min-w-[120px]">Status</th>
                  <th className="p-6 text-left font-semibold text-luxury-text min-w-[200px]">Last Active</th>
                  <th className="p-6 text-left font-semibold text-luxury-text w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-luxury-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(user._id)}
                        onChange={() => {
                          setSelected(prev => 
                            prev.includes(user._id)
                              ? prev.filter(id => id !== user._id)
                              : [...prev, user._id]
                          );
                        }}
                        className="w-5 h-5 rounded text-gold-500 focus:ring-gold-500"
                      />
                    </td>
                    <td className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-gold-400 uppercase">
                          {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-medium text-luxury-text max-w-[200px]">
                      {user.name || 'Unnamed User'}
                    </td>
                    <td className="p-6 text-luxury-dim max-w-[300px] truncate">
                      {user.email}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {user.role?.toUpperCase() || 'CUSTOMER'}
                      </span>
                    </td>
                    <td className="p-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={user.status === 'active'}
                          onChange={(e) => toggleUser(user._id, 'status', e.target.checked ? 'active' : 'banned')}
                          disabled={updating[user._id]}
                          className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 transition-all"
                        />
                        <span className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {updating[user._id] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            user.status === 'active' ? 'Active' : 'Banned'
                          )}
                        </span>
                      </label>
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
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-luxury-border text-xs focus:border-gold-500/50 transition-all"
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role}>{role.toUpperCase()}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => {/* Edit modal */ }}
                          className="p-1.5 text-luxury-dim hover:text-luxury-text hover:bg-white/5 rounded-lg transition-all"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center gap-4 text-sm text-luxury-dim">
          <button className="luxury-btn luxury-btn-secondary px-4 py-2">Previous</button>
          <span>Page 1 of {Math.ceil(users.length / 50)}</span>
          <button className="luxury-btn luxury-btn-secondary px-4 py-2">Next</button>
        </div>
      )}
    </div>
  );
}

