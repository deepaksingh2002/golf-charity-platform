import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentDraw,
  fetchPublishedDraws,
  selectCurrentDraw,
  selectDrawsLoading,
  selectPublishedDraws,
} from '../../store/slices/drawSlice';
import { fetchScores, selectScores } from '../../store/slices/scoreSlice';

export default function DrawPage() {
  const dispatch = useDispatch();
  const publishedDraws = useSelector(selectPublishedDraws);
  const currentDraw = useSelector(selectCurrentDraw);
  const scores = useSelector(selectScores);
  const loading = useSelector(selectDrawsLoading);

  // deps: [dispatch] fetches draw history, current draw state, and player scores when the page mounts.
  useEffect(() => {
    dispatch(fetchPublishedDraws());
    dispatch(fetchCurrentDraw());
    dispatch(fetchScores());
  }, [dispatch]);

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
