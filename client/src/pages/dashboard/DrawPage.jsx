import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetCurrentDrawQuery, useGetDrawHistoryQuery } from '../../store/api/drawApiSlice';
import { useGetScoresQuery } from '../../store/api/scoreApiSlice';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';
import { PaginationControls } from '../../components/ui/PaginationControls';

export default function DrawPage() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { data: publishedDrawsResponse, isLoading: loadingHistory, error: historyError } = useGetDrawHistoryQuery({ page, limit: pageSize });
  const { data: currentDraw, isLoading: loadingActive, error: activeError } = useGetCurrentDrawQuery();
  const { data: scoresResponse, isLoading: loadingScores, error: scoresError } = useGetScoresQuery();

  const loading = loadingHistory || loadingActive || loadingScores;
  const publishedDraws = normalizeApiList(publishedDrawsResponse, 'draws');
  const totalDraws = publishedDrawsResponse?.total ?? publishedDraws.length;
  const totalPages = publishedDrawsResponse?.pages ?? 1;
  const scores = normalizeApiList(scoresResponse, 'scores');

  useEffect(() => {
    if (historyError) toast.error(getApiErrorMessage(historyError, 'Failed to load draw history'));
    if (activeError) toast.error(getApiErrorMessage(activeError, 'Failed to load active draw'));
    if (scoresError) toast.error(getApiErrorMessage(scoresError, 'Failed to load scores'));
  }, [historyError, activeError, scoresError]);

  useEffect(() => {
    setPage(1);
  }, []);

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
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            currentCount={publishedDraws.length}
            totalItems={totalDraws}
            itemLabel="draws"
            onPageChange={setPage}
            loading={loading}
            className="mb-2"
          />
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
