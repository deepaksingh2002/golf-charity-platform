import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { useGetSubscriptionStatusQuery } from '../../api/subscriptionApi';
import { useGetPublishedDrawsQuery } from '../../api/drawApi';
import { useGetScoresQuery } from '../../api/scoreApi';

export default function DashboardOverviewPage() {
  const user = useSelector(selectCurrentUser);
  const { data: subData } = useGetSubscriptionStatusQuery();
  const { data: drawData } = useGetPublishedDrawsQuery();
  const { data: scoreData } = useGetScoresQuery();

  const subscription = subData?.subscription;
  const latestDraw = drawData?.draws?.[0];
  const scores = scoreData?.scores || [];

  const stats = [
    {
      label: 'Subscription',
      value: subscription?.status || user?.subscriptionStatus || 'inactive',
      color: subscription?.status === 'active' ? 'text-emerald-400' : 'text-zinc-400',
    },
    {
      label: 'Scores entered',
      value: scores.length + ' / 5',
      color: 'text-violet-400',
    },
    {
      label: 'Total winnings',
      value: '£' + (user?.totalWinnings || 0).toLocaleString(),
      color: 'text-amber-400',
    },
    {
      label: 'Charity contribution',
      value: (user?.charityPercentage || 10) + '%',
      color: 'text-teal-400',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'Player'}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Here's your platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-xl font-semibold capitalize ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {scores.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Your recent scores</h2>
          <div className="flex gap-3 flex-wrap">
            {scores.slice(0, 5).map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">
                  {s.value}
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {latestDraw && (
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Last draw — {latestDraw.month}</h2>
          <div className="flex gap-2 flex-wrap">
            {latestDraw.drawnNumbers?.map(n => (
              <div key={n} className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
