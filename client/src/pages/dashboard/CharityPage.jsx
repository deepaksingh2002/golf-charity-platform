import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useGetMeQuery, useUpdateProfileMutation } from '../../store/api/authApiSlice';
import { useGetCharitiesQuery } from '../../store/api/charityApiSlice';
import { Spinner } from '../../components/ui/Spinner';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';

const DEFAULT_CHARITY_PERCENTAGE = 10;

function getSelectedCharityId(user) {
  return user?.selectedCharity?._id || user?.selectedCharity || '';
}

export default function CharityPage() {
  const reduxUser = useSelector(selectUser);
  const {
    data: userData,
    refetch: refetchUser,
    isLoading: loadingUser,
    error: userError,
  } = useGetMeQuery(undefined, { skip: !reduxUser });
  const user = userData || reduxUser;
  
  const {
    data: charitiesResponse,
    isLoading: loadingCharities,
    error: charitiesError,
  } = useGetCharitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const charities = useMemo(() => normalizeApiList(charitiesResponse, 'charities'), [charitiesResponse]);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const loading = loadingCharities;
  const saving = isUpdating;

  const [localPct, setLocalPct] = useState(() => reduxUser?.charityPercentage ?? null);
  const [localSelectedId, setLocalSelectedId] = useState(() => getSelectedCharityId(reduxUser));

  useEffect(() => {
    if (userError) {
      toast.error(getApiErrorMessage(userError, 'Failed to load your profile'));
    }
    if (charitiesError) {
      toast.error(getApiErrorMessage(charitiesError, 'Failed to load charities'));
    }
  }, [userError, charitiesError]);

  const pct = localPct ?? DEFAULT_CHARITY_PERCENTAGE;
  const selectedId = localSelectedId || getSelectedCharityId(user);

  const selectedCharity = useMemo(
    () => charities.find((charity) => (charity?._id || charity?.id) === selectedId) ?? null,
    [charities, selectedId],
  );

  const handleSave = async () => {
    if (!selectedId) return toast.error('Please select a charity');
    try {
      await updateProfile({ selectedCharity: selectedId, charityPercentage: pct }).unwrap();
      toast.success('Preferences saved successfully');
      refetchUser();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update preferences'));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My charity</h1>
        <p className="mt-1 text-sm text-zinc-500">Choose who benefits from your subscription</p>
      </div>

      {reduxUser && loadingUser && !userData ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : null}

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Currently supporting</p>
          <p className="text-lg font-medium text-white">{selectedCharity?.name ?? 'No charity selected'}</p>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-500">Select a charity</label>
          {charities.length > 0 ? (
            <select
              value={selectedId}
              onChange={(event) => setLocalSelectedId(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Select a charity</option>
              {charities.map((charity) => (
                <option key={charity?._id ?? charity?.id ?? charity?.name} value={charity?._id ?? charity?.id}>
                  {charity?.name ?? 'Unknown charity'}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300">
              No charities are available from the API yet. Ask an admin to add at least one charity.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-500">Contribution: {pct}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={pct}
            onChange={(event) => setLocalPct(Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading || !selectedId || charities.length === 0}
          className="min-h-11 rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
        >
          {saving ? 'Saving...' : 'Save Preference'}
        </button>
      </div>
    </div>
  );
}
