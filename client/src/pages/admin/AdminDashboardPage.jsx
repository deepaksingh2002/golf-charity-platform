import React from 'react';
import { useGetAdminDashboardStatsQuery } from '../../store/api/adminApiSlice';
import { Users, CreditCard, Trophy, Heart, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useGetAdminDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h3 className="font-bold">Error loading dashboard stats</h3>
        <p className="text-sm">{error?.data?.message || 'Please check your connection and permissions.'}</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users className="text-blue-500" />, trend: '+12% this month' },
    { label: 'Active Subscribers', value: stats?.activeSubscriptions ?? 0, icon: <CreditCard className="text-emerald-500" />, trend: '+5% this month' },
    { label: 'Total Donated', value: `£${(stats?.totalDonated ?? 0).toLocaleString()}`, icon: <Heart className="text-rose-500" />, trend: 'Target: £200k' },
    { label: 'Monthly Pool', value: `£${(stats?.monthlyPool ?? 0).toLocaleString()}`, icon: <Trophy className="text-amber-500" />, trend: 'Next Draw: 3 days' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-zinc-500 mt-1">Platform overview and real-time metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 italic">
                {card.icon}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                {card.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 tracking-tight">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex items-center justify-center min-h-[300px] border-dashed border-zinc-200">
          <div className="text-center">
            <Activity className="mx-auto text-zinc-300 mb-4" size={48} />
            <p className="text-zinc-400 font-medium">Activity Chart Coming Soon</p>
            <p className="text-xs text-zinc-400 mt-1 italic">Real-time usage monitoring is being developed.</p>
          </div>
        </Card>
        <Card className="p-6 border-zinc-900 bg-zinc-950 text-white">
           <h3 className="font-bold mb-4">System Status</h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">API Server</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Operational
                </span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Stripe Integration</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Healthy
                </span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Mailing Service</span>
                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Latency Detected
                </span>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
