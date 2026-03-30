import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllUsers,
  selectAdminUsers,
  selectAdminUsersLoading,
  selectAdminUsersTotal,
} from '../../store/slices/adminSlice';

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const loading = useSelector(selectAdminUsersLoading);
  const total = useSelector(selectAdminUsersTotal);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // deps: [dispatch, page, search] refreshes the paginated admin user list whenever filters change.
  useEffect(() => {
    dispatch(fetchAllUsers({ page, search }));
  }, [dispatch, page, search]);

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none sm:max-w-xs"
        />
      </div>

      <p className="text-sm text-zinc-500">Total: {total ?? 0} users</p>
      {loading ? <p className="text-sm text-zinc-500">Loading...</p> : null}

      <div className="space-y-3">
        {(users ?? []).map((user) => (
          <div key={user?._id ?? user?.email} className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-3">
            <span className="font-medium text-zinc-900">{user?.name ?? 'Unknown user'}</span>
            <span className="text-zinc-600">{user?.email ?? 'No email'}</span>
            <span className="capitalize text-zinc-500">{user?.subscriptionStatus ?? 'inactive'}</span>
          </div>
        ))}
      </div>

      {!loading && (users ?? []).length === 0 ? <p className="text-sm text-zinc-500">No users found.</p> : null}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-zinc-500">Page {page}</span>
        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={loading || (users ?? []).length === 0}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
