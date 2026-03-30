import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats, selectAdminLoading, selectAdminStats } from '../../store/slices/adminSlice';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const stats = useSelector(selectAdminStats);
  const loading = useSelector(selectAdminLoading);

  // deps: [dispatch] fetches the admin dashboard metrics from Redux on mount.
  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading) {
    return <p className="p-6 text-sm text-zinc-500">Loading stats...</p>;
  }

  if (!stats) {
    return <p className="p-6 text-sm text-zinc-500">No stats available</p>;
  }

  const cards = [
    { label: 'Total users', value: stats?.totalUsers ?? 0 },
    { label: 'Active subscribers', value: stats?.activeSubscribers ?? 0 },
    { label: 'Total charities', value: stats?.totalCharities ?? 0 },
    { label: 'Total draws', value: stats?.totalDraws ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={`admin-dashboard-${card.label}`} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
