import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCharityMessages,
  createCharity,
  deleteCharity,
  fetchCharities,
  selectCharities,
  selectCharitiesError,
  selectCharitiesLoading,
  selectCharitiesSuccess,
  toggleFeatured,
  updateCharity,
} from '../../store/slices/charitySlice';

export default function AdminCharitiesPage() {
  const dispatch = useDispatch();
  const charities = useSelector(selectCharities);
  const loading = useSelector(selectCharitiesLoading);
  const error = useSelector(selectCharitiesError);
  const success = useSelector(selectCharitiesSuccess);
  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const [editingId, setEditingId] = useState('');

  // deps: [dispatch] loads the admin charity list from Redux on mount.
  useEffect(() => {
    dispatch(fetchCharities({ limit: 100 }));
  }, [dispatch]);

  // deps: [error, success, dispatch] displays admin charity messages and clears them after toast display.
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

  const resetForm = () => {
    setFormData({ name: '', description: '', website: '' });
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await dispatch(updateCharity({ charityId: editingId, data: formData }));
    } else {
      await dispatch(createCharity(formData));
    }

    dispatch(fetchCharities({ limit: 100 }));
    resetForm();
  };

  const handleDelete = async (charityId) => {
    if (!window.confirm('Delete this charity?')) {
      return;
    }

    await dispatch(deleteCharity(charityId));
    dispatch(fetchCharities({ limit: 100 }));
  };

  const handleToggleFeatured = async (charityId) => {
    await dispatch(toggleFeatured(charityId));
    dispatch(fetchCharities({ limit: 100 }));
  };

  return (
    <div className="space-y-6 p-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">{editingId ? 'Edit charity' : 'Create charity'}</h1>
        <input
          type="text"
          placeholder="Charity name"
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 focus:border-violet-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Website"
          value={formData.website}
          onChange={(event) => setFormData((current) => ({ ...current, website: event.target.value }))}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 focus:border-violet-500 focus:outline-none"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
          className="min-h-[120px] w-full rounded-lg border border-zinc-200 px-3 py-2 focus:border-violet-500 focus:outline-none"
        />
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-violet-500">
            {editingId ? 'Update charity' : 'Create charity'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-lg border border-zinc-200 px-5 py-2.5 text-zinc-700">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <p className="text-sm text-zinc-500">Loading charities...</p> : null}

      <div className="space-y-3">
        {(charities ?? []).map((charity) => (
          <div key={charity?._id ?? charity?.name} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-900">{charity?.name ?? 'Unknown charity'}</p>
                <p className="text-sm text-zinc-500">{charity?.website ?? 'No website listed'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingId(charity?._id ?? '');
                    setFormData({
                      name: charity?.name ?? '',
                      description: charity?.description ?? '',
                      website: charity?.website ?? '',
                    });
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleFeatured(charity?._id)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700"
                >
                  {charity?.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => handleDelete(charity?._id)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
