import React, { useState } from 'react';
import { useGetAllUsersQuery } from '../../store/api/adminApiSlice';
import { Search, ChevronLeft, ChevronRight, User, Mail, Shield, CreditCard, ExternalLink, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetAllUsersQuery({ page, search, limit: 10 });

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  if (error) {
    return (
      <EmptyState 
        icon={Users}
        title="Failed to load users"
        description={error?.data?.message || "Please check your connection and try again."}
        actionLabel="Retry Connection"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-zinc-500 mt-1">Manage and monitor platform members.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-zinc-200 shadow-xl shadow-zinc-500/5">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Spinner size="lg" />
            </div>
          ) : users.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 leading-none">{user.name}</p>
                          <p className="text-xs text-zinc-500 mt-1.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 capitalize text-xs font-bold text-zinc-600">
                        <Shield size={14} className={user.role === 'admin' ? 'text-violet-500' : 'text-zinc-300'} />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
                        {user.subscriptionStatus === 'active' ? 'ACTIVE MEMBER' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/users/${user._id}`}>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-all border-zinc-200 text-zinc-600">
                           Details <ExternalLink size={14} className="ml-2" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-96">
              <EmptyState 
                icon={Search}
                title="No members match"
                description={`We couldn't find any users matching "${search}". Try a different name or email.`}
                actionLabel="Clear Search"
                onAction={() => setSearch('')}
                className="border-none bg-transparent"
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-900">{users.length}</span> of <span className="text-zinc-900">{total}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs font-bold px-3 py-1 bg-white border border-zinc-200 rounded-lg">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
