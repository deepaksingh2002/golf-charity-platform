import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetActiveDrawsQuery, useGetDrawHistoryQuery } from '../../store/api/drawApiSlice';
import { useGetScoresQuery } from '../../store/api/scoreApiSlice';

export default function DrawPage() {
  const { data: publishedDrawsResponse, isLoading: loadingHistory, error: historyError } = useGetDrawHistoryQuery();
  const { data: currentDraw, isLoading: loadingActive, error: activeError } = useGetActiveDrawsQuery();
  const { data: scoresResponse, isLoading: loadingScores, error: scoresError } = useGetScoresQuery();

  const loading = loadingHistory || loadingActive || loadingScores;
  const publishedDraws = Array.isArray(publishedDrawsResponse) ? publishedDrawsResponse : publishedDrawsResponse?.draws || [];
  const scores = Array.isArray(scoresResponse) ? scoresResponse : scoresResponse?.scores || [];

  useEffect(() => {
    if (historyError) toast.error(historyError?.data?.message || 'Failed to load draw history');
    if (activeError) toast.error(activeError?.data?.message || 'Failed to load active draw');
    if (scoresError) toast.error(scoresError?.data?.message || 'Failed to load scores');
  }, [historyError, activeError, scoresError]);

  const userScoreValues = (scores ?? []).map((score) => score?.value).filter((value) => value != null);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Draw history</h1>
        <p className="mt-1 text-sm text-zinc-500">Your entries: {userScoreValues.join(', ') || 'No scores yet'}</p>
        {currentDraw ? <p className="text-sm text-zinc-500">Current draft: {currentDraw?.month ?? 'Unknown'} ({currentDraw?.status ?? 'draft'})</p> : null}
      </div>

      {loading ? <p className="text-sm text-zinc-500">Loading draws...</p> : null}

      {(publishedDraws ?? []).length > 0 ? (
        <div className="space-y-4">
          {(publishedDraws ?? []).map((draw) => (
            <div key={draw?._id ?? draw?.month} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-medium text-white">{draw?.month ?? 'Unknown month'}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(draw?.drawnNumbers ?? []).map((number) => (
                  <span
                    key={`draw-number-${draw?._id ?? draw?.month}-${number}`}
                    className={`rounded-full px-3 py-1 text-sm ${
                      userScoreValues.includes(number)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {number}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-500">Prize pool: GBP {(draw?.prizePool?.total ?? 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        !loading ? <p className="text-sm text-zinc-500">No draws published yet.</p> : null
      )}
    </div>
  );
}
