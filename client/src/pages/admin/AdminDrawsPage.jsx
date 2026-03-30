import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearDrawMessages,
  createDraw,
  fetchCurrentDraw,
  fetchPublishedDraws,
  publishDraw,
  selectActiveDraft,
  selectDrawsError,
  selectDrawsLoading,
  selectDrawsSuccess,
  selectPublishedDraws,
  selectPublishLoading,
  selectSimulateLoading,
  simulateDraw,
} from '../../store/slices/drawSlice';

export default function AdminDrawsPage() {
  const dispatch = useDispatch();
  const publishedDraws = useSelector(selectPublishedDraws);
  const activeDraft = useSelector(selectActiveDraft);
  const loading = useSelector(selectDrawsLoading);
  const simLoading = useSelector(selectSimulateLoading);
  const pubLoading = useSelector(selectPublishLoading);
  const error = useSelector(selectDrawsError);
  const success = useSelector(selectDrawsSuccess);

  // deps: [dispatch] loads both draw history and the current draft from Redux when the page opens.
  useEffect(() => {
    dispatch(fetchPublishedDraws());
    dispatch(fetchCurrentDraw());
  }, [dispatch]);

  // deps: [error, success, dispatch] displays draw workflow messages and clears them after use.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearDrawMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearDrawMessages());
    }
  }, [error, success, dispatch]);

  const handleCreate = async () => {
    const result = await dispatch(createDraw({ drawType: 'random' }));
    if (createDraw.fulfilled.match(result)) {
      dispatch(fetchCurrentDraw());
    }
  };

  const handleSimulate = async () => {
    const draftId = activeDraft?._id ?? 'current';
    if (!draftId) {
      toast.error('Create a draw first');
      return;
    }

    await dispatch(simulateDraw(draftId));
  };

  const handlePublish = async () => {
    const draftId = activeDraft?._id ?? 'current';
    if (!draftId) {
      toast.error('Simulate a draw first');
      return;
    }

    if (!window.confirm('Publish this draw?')) {
      return;
    }

    const result = await dispatch(publishDraw(draftId));
    if (publishDraw.fulfilled.match(result)) {
      dispatch(fetchPublishedDraws());
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-violet-500 disabled:bg-zinc-400"
        >
          Create draw
        </button>
        <button
          onClick={handleSimulate}
          disabled={simLoading || !activeDraft}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-400"
        >
          {simLoading ? 'Simulating...' : 'Simulate'}
        </button>
        <button
          onClick={handlePublish}
          disabled={pubLoading || activeDraft?.status !== 'simulated'}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-400"
        >
          {pubLoading ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {activeDraft ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="font-medium text-zinc-900">Draft: {activeDraft?.month ?? 'Unknown month'}</p>
          <p className="text-sm text-zinc-500">Status: {activeDraft?.status ?? 'draft'}</p>
          {(activeDraft?.drawnNumbers ?? []).length > 0 ? (
            <p className="mt-2 text-sm text-zinc-600">Numbers: {activeDraft.drawnNumbers.join(', ')}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No active draft available.</p>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900">Published draws ({publishedDraws?.length ?? 0})</h3>
        {(publishedDraws ?? []).map((draw) => (
          <div key={draw?._id ?? draw?.month} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-zinc-900">{draw?.month ?? 'Unknown month'}</p>
            <p className="text-sm text-zinc-500">Numbers: {(draw?.drawnNumbers ?? []).join(', ') || 'None yet'}</p>
            <p className="text-sm text-zinc-500">Participants: {draw?.participantCount ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
