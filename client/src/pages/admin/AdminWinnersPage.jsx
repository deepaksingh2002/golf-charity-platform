import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAdminMessages,
  fetchWinnersList,
  selectAdminError,
  selectAdminLoading,
  selectAdminSuccess,
  selectAdminWinners,
  verifyWinner,
} from '../../store/slices/adminSlice';

export default function AdminWinnersPage() {
  const dispatch = useDispatch();
  const winners = useSelector(selectAdminWinners);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const success = useSelector(selectAdminSuccess);

  // deps: [dispatch] loads the winners list when the admin winners page mounts.
  useEffect(() => {
    dispatch(fetchWinnersList());
  }, [dispatch]);

  // deps: [error, success, dispatch] handles winner verification messages coming from Redux.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAdminMessages());
    }
  }, [error, success, dispatch]);

  const handleVerify = async (drawId, userId) => {
    const result = await dispatch(verifyWinner({ drawId, userId }));

    if (verifyWinner.fulfilled.match(result)) {
      dispatch(fetchWinnersList());
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-zinc-500">Loading winners...</p>;
  }

  if (!(winners ?? []).length) {
    return <p className="p-6 text-sm text-zinc-500">No winners yet</p>;
  }

  return (
    <div className="space-y-3 p-6">
      {(winners ?? []).map((winner) => (
        <div key={`${winner?.drawId ?? 'draw'}-${winner?.winnerId ?? winner?.userId?._id ?? 'winner'}`} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="font-medium text-zinc-900">{winner?.userName ?? winner?.userId?.name ?? 'Unknown'}</p>
          <p className="text-sm text-zinc-500">{winner?.matchCount ?? 0}-match - GBP {(winner?.prizeAmount ?? 0).toFixed(2)}</p>
          <p className="text-sm capitalize text-zinc-500">{winner?.paymentStatus ?? 'pending'}</p>
          {winner?.paymentStatus === 'pending' ? (
            <button
              onClick={() => handleVerify(winner?.drawId, winner?.winnerId ?? winner?.userId?._id)}
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Mark as paid
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
