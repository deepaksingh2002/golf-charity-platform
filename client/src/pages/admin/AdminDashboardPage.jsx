import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Users, CreditCard, Trophy, Wallet, HeartHandshake, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', subscriptions: 400 },
  { name: 'Feb', subscriptions: 600 },
  { name: 'Mar', subscriptions: 850 },
  { name: 'Apr', subscriptions: 1100 },
  { name: 'May', subscriptions: 1400 },
  { name: 'Jun', subscriptions: 1950 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardStats(),
      adminApi.getWinners({ paymentStatus: 'pending' })
    ])
      .then(([statsRes, winnersRes]) => {
        setStats(statsRes.data);
        const pending = Array.isArray(winnersRes.data)
          ? winnersRes.data.length
          : winnersRes.data?.winners?.length || 0;
        setPendingVerifications(pending);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load admin dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-red-900">Admin dashboard unavailable</h1>
          <p className="mt-2 text-sm text-red-700">{error || 'The dashboard data could not be loaded.'}</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || 0, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Subscribers', value: stats.activeSubscribers?.toLocaleString() || 0, icon: <CreditCard size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Monthly Revenue', value: `$${stats.currentMonthRevenue?.toLocaleString() || 0}`, icon: <Wallet size={20} />, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Prize Pool Balance', value: `$${stats.totalPrizePool?.toLocaleString() || 0}`, icon: <Trophy size={20} />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Charity Distributed', value: `$${stats.totalCharityDistributed?.toLocaleString() || 0}`, icon: <HeartHandshake size={20} />, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Pending Verifications', value: pendingVerifications, icon: <AlertCircle size={20} />, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">System Overview</h1>
        <p className="text-zinc-500 mt-1">Real-time metrics and platform health.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="border-zinc-200/60 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
             <CardTitle>Subscription Growth Placeholder</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="subscriptions" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6 mt-4">
               {[
                 { action: 'New User Registered', entity: 'john.doe@email.com', time: '2 mins ago', color: 'bg-emerald-500' },
                 { action: 'Subscription Created', entity: 'Yearly Plan - $250', time: '14 mins ago', color: 'bg-violet-500' },
                 { action: 'Score Submitted', entity: 'Score: 41', time: '1 hour ago', color: 'bg-blue-500' },
                 { action: 'Winner Verified', entity: 'Tier: Jackpot', time: '3 hours ago', color: 'bg-amber-500' },
                 { action: 'Charity Updated', entity: 'Ocean Cleanup', time: '5 hours ago', color: 'bg-zinc-500' },
               ].map((item, i) => (
                 <div key={i} className="flex relative items-start pb-6 last:pb-0 font-sans">
                   {i !== 4 && <div className="absolute left-2.5 top-6 bottom-0 w-px bg-zinc-200"></div>}
                   <div className={`w-5 h-5 rounded-full ${item.color} mt-1 ring-4 ring-white shrink-0 z-10`}></div>
                   <div className="ml-4 flex-1">
                     <p className="text-sm font-semibold text-zinc-900">{item.action}</p>
                     <p className="text-xs text-zinc-500">{item.entity}</p>
                   </div>
                   <span className="text-xs text-zinc-400">{item.time}</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
