import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, updateUser } from '../../store/authSlice';
import { useGetCharitiesQuery } from '../../api/charityApi';
import { useUpdateProfileMutation } from '../../api/authApi';
import toast from 'react-hot-toast';

export default function CharityPage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { data, isLoading } = useGetCharitiesQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [pct, setPct] = useState(user?.charityPercentage || 10);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const charities = data?.charities || [];
  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = charities.find(c => c._id === user?.selectedCharity?._id || c._id === user?.selectedCharity);

  const handleSave = async () => {
    try {
      const result = await updateProfile({
        charityPercentage: pct,
        selectedCharity: user?.selectedCharity?._id || user?.selectedCharity,
      }).unwrap();
      dispatch(updateUser(result.user));
      toast.success('Charity settings saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleSelect = async (charity) => {
    try {
      const result = await updateProfile({
        selectedCharity: charity._id,
        charityPercentage: pct,
      }).unwrap();
      dispatch(updateUser(result.user));
      setShowModal(false);
      toast.success(`Supporting ${charity.name}`);
    } catch {
      toast.error('Failed to update charity');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My charity</h1>
        <p className="text-zinc-400 text-sm mt-1">Choose who benefits from your subscription</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Currently supporting</p>
            <p className="text-white font-medium text-lg">
              {selected?.name || 'No charity selected'}
            </p>
            {selected?.description && (
              <p className="text-zinc-500 text-sm mt-1 max-w-md">{selected.description}</p>
            )}
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-zinc-700 text-zinc-300 hover:border-emerald-600
              hover:text-emerald-400 rounded-lg text-sm transition-colors whitespace-nowrap">
            Change charity
          </button>
        </div>

        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
            Contribution: {pct}% of your subscription
          </label>
          <input type="range" min="10" max="100" value={pct}
            onChange={e => setPct(Math.max(10, +e.target.value))}
            className="w-full accent-emerald-500" />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>10% (minimum)</span><span>100%</span>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700
            text-white rounded-lg font-medium transition-colors min-h-[44px]">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Select modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-medium mb-4">Choose a charity</h2>
            <input type="text" placeholder="Search charities..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg
                text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4" />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isLoading ? <p className="text-zinc-500 text-sm">Loading...</p> :
                filtered.map(c => (
                  <button key={c._id} onClick={() => handleSelect(c)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700
                      border border-zinc-700 hover:border-emerald-600 transition-colors">
                    <p className="text-white font-medium text-sm">{c.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{c.description}</p>
                  </button>
                ))
              }
            </div>
            <button onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
