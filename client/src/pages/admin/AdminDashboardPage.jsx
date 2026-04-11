import React from 'react';
import { useGetAdminDashboardStatsQuery } from '../../store/api/adminApiSlice';
import { Users, CreditCard, Trophy, Heart, TrendingUp, Activity, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { motion as Motion } from 'framer-motion';
import { getApiErrorMessage } from '../../store/api/apiUtils';
import { useGetHealthQuery } from '../../store/api/systemApiSlice';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const buildRevenueSeries = (stats) => {
  const candidates = [
    stats?.revenueTrend,
    stats?.monthlyRevenue,
    stats?.revenueByMonth,
    stats?.analytics?.revenueTrend,
  ];

  const source = candidates.find((entry) => Array.isArray(entry)) || [];
  return source
    .map((item, index) => ({
      name: item?.month || item?.label || item?.name || `M${index + 1}`,
      revenue: Number(item?.revenue ?? item?.value ?? item?.total ?? 0),
    }))
    .filter((item) => Number.isFinite(item.revenue));
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useGetAdminDashboardStatsQuery();
  const { data: healthData, isFetching: checkingHealth, error: healthError } = useGetHealthQuery();

  const revenueSeries = buildRevenueSeries(stats);
  const hasRevenueSeries = revenueSeries.length > 0;
  const apiHealthy = !healthError && !!healthData;

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
        <p className="text-sm">{getApiErrorMessage(error, 'Please check your connection and permissions.')}</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users className="text-blue-500" />, trend: '+12%', color: 'blue' },
    { label: 'Active Subscribers', value: stats?.activeSubscriptions ?? 0, icon: <CreditCard className="text-emerald-500" />, trend: '+5%', color: 'emerald' },
    { label: 'Total Donated', value: `£${(stats?.totalDonated ?? 0).toLocaleString()}`, icon: <Heart className="text-rose-500" />, trend: 'Target: 200k', color: 'rose' },
    { label: 'Monthly Pool', value: `£${(stats?.monthlyPool ?? 0).toLocaleString()}`, icon: <Trophy className="text-amber-500" />, trend: 'Next Draw: 3d', color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">System Overview</h1>
          <p className="text-zinc-500 mt-1">Real-time metrics and platform analytics hub.</p>
        </Motion.div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm text-xs font-bold text-zinc-500 group cursor-default">
           <Activity size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
           LIVE MONITORING ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-transparent hover:border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-zinc-50 border border-zinc-100`}>
                  {card.icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full`}>
                  <TrendingUp size={10} />
                  {card.trend}
                </div>
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-zinc-900 tracking-tighter">{card.value}</p>
            </Card>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col min-h-100">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="font-bold text-zinc-900 text-lg">Subscription Revenue</h3>
                <p className="text-xs text-zinc-400 font-medium">Monthly revenue growth for current year.</p>
             </div>
             <Badge variant="active" className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">+28% growth</Badge>
          </div>
          
          <div className="flex-1 w-full min-h-62.5">
            {hasRevenueSeries ? (
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
                No revenue trend data available yet.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-zinc-900 bg-zinc-950 text-white flex flex-col group">
           <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="text-emerald-400 group-hover:scale-110 transition-transform" size={20} />
                Critical Infrastructure
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Real-time dependency health.</p>
           </div>
           
           <div className="p-6 space-y-6 flex-1">
             {[
               {
                 name: 'Core API Server',
                 status: checkingHealth ? 'Checking' : (apiHealthy ? 'Operational' : 'Unavailable'),
                 icon: <Activity />,
                 sub: checkingHealth ? 'Health check in progress' : (apiHealthy ? 'Health endpoint reachable' : 'Health endpoint failing'),
                 error: !checkingHealth && !apiHealthy,
               },
               { name: 'Stripe Gateway', status: 'Operational', icon: <CreditCard />, sub: 'Uptime: 99.9%' },
               { name: 'Mailing Service', status: 'Degraded', icon: <AlertCircle />, sub: 'Latency: High', error: true },
             ].map((item) => (
               <div key={item.name} className="flex items-start justify-between">
                  <div className="flex gap-3">
                     <div className={`p-2 rounded-lg ${item.error ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.icon}
                     </div>
                     <div>
                        <p className="text-sm font-bold leading-none">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">{item.sub}</p>
                     </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] ${item.error ? 'text-amber-400' : 'text-emerald-400'} font-black`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${item.error ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`} />
                    {item.status.toUpperCase()}
                  </div>
               </div>
             ))}
           </div>

           <div className="mt-auto bg-zinc-900/40 p-6 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Global Status</span>
                 <span className="text-sm font-bold text-emerald-400 uppercase">Secure Environment</span>
              </div>
              <CheckCircle2 className="text-zinc-700" size={32} />
           </div>
        </Card>
      </div>
    </div>
  );
}
