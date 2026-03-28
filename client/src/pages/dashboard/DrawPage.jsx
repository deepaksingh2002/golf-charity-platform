import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { useGetPublishedDrawsQuery } from '../../api/drawApi';
import { useGetScoresQuery } from '../../api/scoreApi';

const DrawnBall = ({ number, matched }) => (
  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm
    ${matched ? 'bg-emerald-500 text-white ring-2 ring-emerald-300' : 'bg-zinc-700 text-zinc-300'}`}>
    {number}
  </div>
);

export default function DrawPage() {
  const user = useSelector(selectCurrentUser);
  const { data: drawData, isLoading: drawLoading } = useGetPublishedDrawsQuery();
  const { data: scoreData } = useGetScoresQuery();

  const draws = drawData?.draws || [];
  const userScoreValues = (scoreData?.scores || []).map(s => s.value);

  if (drawLoading) return <div className="p-6 text-zinc-400">Loading draws...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Draw history</h1>
        <p className="text-zinc-400 text-sm mt-1">Monthly draw results and your matches</p>
      </div>

      {userScoreValues.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Your current entries</p>
          <div className="flex gap-2 flex-wrap">
            {userScoreValues.map((v, i) => (
              <div key={i} className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                {v}
              </div>
            ))}
          </div>
        </div>
      )}

      {draws.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-10 border border-zinc-800 text-center">
          <p className="text-zinc-500">No draws published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => {
            const matches = userScoreValues.filter(v => draw.drawnNumbers?.includes(v));
            return (
              <div key={draw._id} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">{draw.month}</p>
                    <p className="text-zinc-500 text-xs">{draw.participantCount} participants</p>
                  </div>
                  {matches.length >= 3 && (
                    <span className="px-3 py-1 bg-emerald-900 text-emerald-400 rounded-full text-xs font-medium">
                      {matches.length}-number match!
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {draw.drawnNumbers?.map(n => (
                    <DrawnBall key={n} number={n} matched={userScoreValues.includes(n)} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800">
                  {[
                    { label: '5-match jackpot', value: draw.prizePool?.fiveMatch },
                    { label: '4-match prize', value: draw.prizePool?.fourMatch },
                    { label: '3-match prize', value: draw.prizePool?.threeMatch },
                  ].map(p => (
                    <div key={p.label}>
                      <p className="text-xs text-zinc-500">{p.label}</p>
                      <p className="text-emerald-400 font-medium">£{(p.value || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
