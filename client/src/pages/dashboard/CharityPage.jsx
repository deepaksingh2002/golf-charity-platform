import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectUser } from '../../store/slices/authSlice';
import {
  clearCharityMessages,
  fetchCharities,
  selectCharities,
  selectCharitiesError,
  selectCharitiesLoading,
  selectCharitiesSuccess,
  selectUserCharity,
} from '../../store/slices/charitySlice';

export default function CharityPage() {
  const dispatch = useDispatch();
  const charities = useSelector(selectCharities);
  const user = useSelector(selectUser);
  const loading = useSelector(selectCharitiesLoading);
  const error = useSelector(selectCharitiesError);
  const success = useSelector(selectCharitiesSuccess);
  const [pct, setPct] = useState(user?.charityPercentage ?? 10);
  const [selectedId, setSelectedId] = useState(user?.selectedCharity?._id || user?.selectedCharity || '');
  const [saving, setSaving] = useState(false);

  // deps: [dispatch] loads charities from Redux when the dashboard charity page mounts.
  useEffect(() => {
    dispatch(fetchCharities({ limit: 100 }));
  }, [dispatch]);

  // deps: [user] keeps local form controls aligned with the latest auth profile from Redux.
  useEffect(() => {
    setPct(user?.charityPercentage ?? 10);
    setSelectedId(user?.selectedCharity?._id || user?.selectedCharity || '');
  }, [user]);

  // deps: [error, success, dispatch] surfaces charity save state via toasts and clears messages after display.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCharityMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearCharityMessages());
    }
  }, [error, success, dispatch]);

  const selectedCharity = useMemo(
    () => charities.find((charity) => charity?._id === selectedId) ?? null,
    [charities, selectedId],
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(selectUserCharity({ charityId: selectedId, percentage: pct }));
    setSaving(false);

    if (selectUserCharity.fulfilled.match(result)) {
      dispatch(fetchCurrentUser());
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My charity</h1>
        <p className="mt-1 text-sm text-zinc-500">Choose who benefits from your subscription</p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Currently supporting</p>
          <p className="text-lg font-medium text-white">{selectedCharity?.name ?? 'No charity selected'}</p>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-500">Select a charity</label>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select a charity</option>
            {(charities ?? []).map((charity) => (
              <option key={charity?._id ?? charity?.name} value={charity?._id}>
                {charity?.name ?? 'Unknown charity'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-500">Contribution: {pct}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={pct}
            onChange={(event) => setPct(Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading || !selectedId}
          className="min-h-[44px] rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
        >
          {saving ? 'Saving...' : 'Save Preference'}
        </button>
      </div>
    </div>
  );
}
