import { useState } from 'react';
import { useGetAllUsersQuery } from '../../api/adminApi';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetAllUsersQuery({ search, status, page, limit: 10 });

  const users = data?.users || [];
  const totalPages = data?.pages || 1;

  const filters = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Lapsed', value: 'lapsed' },
  ];

  const statusColor = {
    active: 'text-emerald-400 bg-emerald-950',
    inactive: 'text-zinc-400 bg-zinc-800',
    lapsed: 'text-red-400 bg-red-950',
    cancelled: 'text-amber-400 bg-amber-950',
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-semibold text-white">Users</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search name or email..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl
            text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-sm" />
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${status === f.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Name', 'Email', 'Plan', 'Status', 'Scores'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map(u => (
                  <tr key={u._id} className={`hover:bg-zinc-800/50 transition-colors ${isFetching ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4 text-white text-sm font-medium">{u.name}</td>
                    <td className="px-5 py-4 text-zinc-400 text-sm">{u.email}</td>
                    <td className="px-5 py-4 text-zinc-400 text-sm capitalize">{u.subscriptionPlan || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${statusColor[u.subscriptionStatus] || 'text-zinc-400 bg-zinc-800'}`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 text-sm">{u.scores?.length ?? 0} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400
              disabled:opacity-40 hover:border-zinc-600 text-sm">
            Previous
          </button>
          <span className="text-zinc-500 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400
              disabled:opacity-40 hover:border-zinc-600 text-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
