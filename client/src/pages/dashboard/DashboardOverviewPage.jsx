import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useGetScoresQuery } from '../../store/api/scoreApiSlice';
import { useGetSubscriptionStatusQuery } from '../../store/api/subscriptionApiSlice';
import { useGetMeQuery } from '../../store/api/authApiSlice';

export default function DashboardOverviewPage() {
  const reduxUser = useSelector(selectUser);
  const { data: userData } = useGetMeQuery(undefined, { skip: !reduxUser });
  const user = userData || reduxUser;
  const { data: scoresResponse } = useGetScoresQuery();
  const { data: subData } = useGetSubscriptionStatusQuery();
  
  const scores = Array.isArray(scoresResponse) ? scoresResponse : scoresResponse?.scores || [];
  const subStatus = subData?.status || user?.subscriptionStatus || 'inactive';
  const renewDate = subData?.currentPeriodEnd;
  
  if (!user) return <div className="flex justify-center p-12">Loading...</div>;

  const cards = [
    { label: 'Subscription', value: subStatus ?? user?.subscriptionStatus ?? 'inactive', color: 'text-emerald-400' },
    { label: 'Scores entered', value: `${scores?.length ?? 0} / 5`, color: 'text-violet-400' },
    { label: 'Total winnings', value: `GBP ${(user?.totalWinnings ?? 0).toFixed(2)}`, color: 'text-amber-400' },
    { label: 'Charity contribution', value: `${user?.charityPercentage ?? 10}%`, color: 'text-teal-400' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome, {user?.name ?? 'Player'}</h1>
        <p className="mt-1 text-sm text-zinc-500">Subscription renews: {renewDate ? new Date(renewDate).toLocaleDateString('en-GB') : 'No renewal date'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={`overview-card-${card.label}`} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">{card.label}</p>
            <p className={`text-xl font-semibold capitalize ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
