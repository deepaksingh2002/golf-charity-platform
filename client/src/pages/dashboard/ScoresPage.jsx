import { useState } from 'react';
import { useGetScoresQuery, useAddScoreMutation, useDeleteScoreMutation } from '../../api/scoreApi';
import toast from 'react-hot-toast';

export default function ScoresPage() {
  const { data, isLoading, isError } = useGetScoresQuery();
  const [addScore, { isLoading: adding }] = useAddScoreMutation();
  const [deleteScore, { isLoading: deleting }] = useDeleteScoreMutation();

  const [value, setValue] = useState(25);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const scores = data?.scores || [];

  const handleAdd = async () => {
    if (!date) { toast.error('Please select a date'); return; }
    try {
      await addScore({ value: parseInt(value), date }).unwrap();
      toast.success('Score added');
      setValue(25);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to add score');
    }
  };

  const handleDelete = async (scoreId) => {
    if (!confirm('Delete this score?')) return;
    try {
      await deleteScore(scoreId).unwrap();
      toast.success('Score removed');
    } catch {
      toast.error('Failed to delete score');
    }
  };

  if (isLoading) return <div className="p-6 text-zinc-400">Loading scores...</div>;
  if (isError) return <div className="p-6 text-red-400">Failed to load scores.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My scores</h1>
        <p className="text-zinc-400 text-sm mt-1">Enter your last 5 Stableford scores (1–45)</p>
      </div>

      {/* Entry form */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">Add new score</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 mb-2 block">Score value: {value}</label>
            <input type="range" min="1" max="45" value={value}
              onChange={e => setValue(+e.target.value)}
              className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>1</span><span>45</span>
            </div>
          </div>
          <div className="sm:w-48">
            <label className="text-xs text-zinc-500 mb-2 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700
                text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:self-end">
            <button onClick={handleAdd} disabled={adding}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500
                disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors min-h-[44px]">
              {adding ? 'Adding...' : 'Add score'}
            </button>
          </div>
        </div>
      </div>

      {/* Scores list */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">
            Your scores ({scores.length}/5)
            {scores.length === 0 && <span className="ml-2 text-zinc-500">— add your first score above</span>}
          </h2>
        </div>
        {scores.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-500 text-sm">No scores yet</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {scores.map((s) => (
              <div key={s._id} className="flex items-center px-5 py-4 gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {s.value}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Score: {s.value}</p>
                  <p className="text-zinc-500 text-sm">
                    {new Date(s.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}
                  </p>
                </div>
                <button onClick={() => handleDelete(s._id)} disabled={deleting}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950
                    rounded-lg transition-colors border border-transparent hover:border-red-900">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
