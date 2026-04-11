import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetScoresQuery, 
  useAddScoreMutation, 
  useDeleteScoreMutation 
} from '../../store/api/scoreApiSlice';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';

export default function ScoresPage() {
  const { data: scoresResponse, isLoading, error } = useGetScoresQuery();
  const scores = normalizeApiList(scoresResponse, 'scores');
  const [addScore, { isLoading: isAdding }] = useAddScoreMutation();
  const [deleteScore] = useDeleteScoreMutation();

  const [value, setValue] = useState(25);
  const [date, setDate] = useState('');

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    try {
      await addScore({ value, date }).unwrap();
      toast.success('Score added!');
      setValue(25);
      setDate('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add score'));
    }
  };

  const handleDelete = async (scoreId) => {
    if (!window.confirm('Delete this score?')) return;

    try {
      await deleteScore(scoreId).unwrap();
      toast.success('Score deleted!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete score'));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My scores</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter your last 5 Stableford scores (1-45)</p>
      </div>

      <form onSubmit={handleAdd} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-xs text-zinc-500">Score value</label>
            <input
              type="number"
              min="1"
              max="45"
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="sm:w-56">
            <label className="mb-2 block text-xs text-zinc-500">Date</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              disabled={isAdding || isLoading}
              className="min-h-11 rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
            >
              {isAdding ? 'Adding...' : 'Add Score'}
            </button>
          </div>
        </div>
      </form>

      {isLoading ? <p className="text-sm text-zinc-500">Loading scores...</p> : null}
      {error ? <p className="text-sm text-red-500">Error loading scores: {getApiErrorMessage(error, 'Unknown error')}</p> : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        {(scores ?? []).length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {(scores ?? []).map((score) => (
              <div key={score?._id ?? `score-${score?.date ?? score?.value ?? 'unknown'}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-white">{score?.value ?? 0} pts</p>
                  <p className="text-sm text-zinc-500">
                    {score?.date ? new Date(score.date).toLocaleDateString('en-GB') : 'No date'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(score?._id)}
                  className="rounded-lg border border-transparent px-3 py-1.5 text-xs text-red-400 transition-colors hover:border-red-900 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isLoading ? <p className="p-5 text-sm text-zinc-500">No scores yet. Add your first score above.</p> : null
        )}
      </div>
    </div>
  );
}
