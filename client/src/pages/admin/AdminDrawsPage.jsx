import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetActiveDrawsQuery, 
  useGetDrawHistoryQuery,
  useCreateDrawMutation,
  useSimulateDrawMutation,
  usePublishDrawMutation
} from '../../store/api/drawApiSlice';

export default function AdminDrawsPage() {
  const { data: publishedDrawsResponse, isLoading: loadingHistory, error: historyError } = useGetDrawHistoryQuery();
  const { data: activeDraft, isLoading: loadingActive, error: activeError } = useGetActiveDrawsQuery();
  const publishedDraws = Array.isArray(publishedDrawsResponse) ? publishedDrawsResponse : publishedDrawsResponse?.draws || [];

  const [createDraw, { isLoading: isCreating }] = useCreateDrawMutation();
  const [simulateDraw, { isLoading: isSimulating }] = useSimulateDrawMutation();
  const [publishDraw, { isLoading: isPublishing }] = usePublishDrawMutation();

  const loading = loadingHistory || loadingActive || isCreating;
  const simLoading = isSimulating;
  const pubLoading = isPublishing;

  useEffect(() => {
    if (historyError) toast.error(historyError?.data?.message || 'Failed to load publish history');
    if (activeError) toast.error(activeError?.data?.message || 'Failed to load active draft');
  }, [historyError, activeError]);

  const handleCreate = async () => {
    try {
      await createDraw({ drawType: 'random' }).unwrap();
      toast.success('Draw created successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create draw');
    }
  };

  const handleSimulate = async () => {
    const draftId = activeDraft?._id ?? 'current';
    if (!draftId || draftId === 'current') {
      if (!activeDraft?._id) return toast.error('Create a draw first');
    }
    
    try {
      await simulateDraw(activeDraft._id).unwrap();
      toast.success('Draw simulated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to simulate draw');
    }
  };

  const handlePublish = async () => {
    const draftId = activeDraft?._id ?? 'current';
    if (!draftId || draftId === 'current') {
      if (!activeDraft?._id) return toast.error('Simulate a draw first');
    }

    if (!window.confirm('Publish this draw?')) return;

    try {
      await publishDraw(activeDraft._id).unwrap();
      toast.success('Draw published successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish draw');
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
