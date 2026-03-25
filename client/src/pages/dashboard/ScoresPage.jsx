import React, { useEffect, useState } from 'react';
import { scoreApi } from '../../api/score.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(20);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScores = () => {
    scoreApi.getScores()
      .then(res => { setScores(res.data); setLoading(false); })
      .catch(err => { toast.error('Failed to load scores'); setLoading(false); });
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await scoreApi.addScore({ value: Number(value), date });
      toast.success('Score saved!');
      fetchScores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving score');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await scoreApi.deleteScore(id);
      toast.success('Score deleted');
      fetchScores();
    } catch (err) {
      toast.error('Error deleting score');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Scores</h1>
        <p className="text-zinc-500 mt-1">Submit your latest golf scores. You need exactly 5 scores to enter a draw.</p>
      </div>

      {scores.length < 5 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <p className="text-amber-800 text-sm">
            <strong>Attention:</strong> You currently have {scores.length} score(s). You need {5 - scores.length} more to be eligible for the next draw.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Score</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Score Value: <span className="font-bold text-brand-600">{value}</span></label>
                <input 
                  type="range" min="1" max="45" 
                  value={value} onChange={e => setValue(e.target.value)} 
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                  <span>1</span><span>45</span>
                </div>
              </div>
              <Input 
                label="Date Played" 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Submit Score'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scores History</CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">No scores registered yet.</p>
            ) : (
              <div className="space-y-3">
                {scores.map((score, idx) => (
                  <div key={score._id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 text-lg">{score.value}</p>
                        <p className="text-xs text-zinc-500">{new Date(score.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(score._id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
