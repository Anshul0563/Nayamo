import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { adminAPI } from '../services/api';
import { Search, Loader2, Users as UsersIcon, UserCheck, UserX, Crown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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
        status: statusFilter || undefined 
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

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map(u => u._id));
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
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="text-gray-400">Manage your customer and admin accounts</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#0d0d0d] border border-yellow-500/20 rounded-2xl p-5 shadow-[0_0_25px_rgba(212,168,83,0.08)]">
          <StatCard title="Total Users" value={totalItems} icon={<UsersIcon />} />
        </div>
        <div className="bg-[#0d0d0d] border border-yellow-500/20 rounded-2xl p-5">
          <StatCard title="Active" value={users.filter(u => u.isActive).length} icon={<UserCheck />} />
        </div>
        <div className="bg-[#0d0d0d] border border-yellow-500/20 rounded-2xl p-5">
          <StatCard title="Banned" value={users.filter(u => !u.isActive).length} icon={<UserX />} />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0d0d] border border-gray-700 text-white focus:border-yellow-500 outline-none"
          />
        </div>

        <div className="flex gap-3">
          <select className="px-4 py-3 rounded-xl bg-[#0d0d0d] border border-gray-700 text-white">
            <option>All Roles</option>
          </select>

          <select className="px-4 py-3 rounded-xl bg-[#0d0d0d] border border-gray-700 text-white">
            <option>All Status</option>
          </select>

          <ExportButton filename="users" data={exportData} />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-3xl border border-yellow-500/20 bg-[#0d0d0d] overflow-hidden">

        <table className="w-full">
          <thead className="bg-black border-b border-gray-800">
            <tr>
              <th className="p-5">
                <input type="checkbox" onChange={selectAll} />
              </th>
              <th className="p-5 text-left text-yellow-400">User</th>
              <th className="p-5 text-left text-yellow-400">Role</th>
              <th className="p-5 text-left text-yellow-400">Status</th>
              <th className="p-5 text-left text-yellow-400">Last Active</th>
              <th className="p-5 text-left text-yellow-400">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              users.map(user => (
                <tr key={user._id} className="border-b border-gray-800 hover:bg-[#111] transition">

                  <td className="p-5">
                    <input
                      type="checkbox"
                      checked={selected.includes(user._id)}
                      onChange={() => toggleSelect(user._id)}
                    />
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                        <Crown size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      user.isActive
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>

                  <td className="p-5 text-gray-500 text-sm">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString('en-IN') : 'Never'}
                  </td>

                  <td className="p-5">
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Ban
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button className="px-4 py-2 bg-[#0d0d0d] border border-gray-700 rounded-xl">
          <ChevronLeft size={16} />
        </button>

        <span className="text-gray-400">Page {page}</span>

        <button className="px-4 py-2 bg-[#0d0d0d] border border-gray-700 rounded-xl">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}