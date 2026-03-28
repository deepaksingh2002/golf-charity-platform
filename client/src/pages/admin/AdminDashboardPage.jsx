import { useGetDashboardStatsQuery } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useGetDashboardStatsQuery();
  const stats = data || {};

  const cards = [
    { label: 'Total users', value: stats.totalUsers ?? '—', color: 'text-violet-400' },
    { label: 'Active subscribers', value: stats.activeSubscribers ?? '—', color: 'text-emerald-400' },
    { label: 'Total charities', value: stats.totalCharities ?? '—', color: 'text-teal-400' },
    { label: 'Total draws', value: stats.totalDraws ?? '—', color: 'text-amber-400' },
  ];

  if (isLoading) return (
    <div className="p-6 flex items-center gap-3 text-zinc-400">
      <div className="w-5 h-5 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin"/>
      Loading stats...
    </div>
  );

  if (isError) return (
    <div className="p-6">
      <p className="text-red-400 mb-4">Failed to load dashboard stats</p>
      <button onClick={refetch} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm">
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Platform overview and controls</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
