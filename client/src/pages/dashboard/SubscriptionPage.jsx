import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import {
  cancelSubscription,
  clearSubscriptionMessages,
  createSubscription,
  fetchSubscriptionStatus,
  selectSubscriptionError,
  selectSubscriptionLoading,
  selectSubscriptionPlan,
  selectSubscriptionRenewDate,
  selectSubscriptionStatus,
  selectSubscriptionSuccess,
} from '../../store/slices/subscriptionSlice';

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const status = useSelector(selectSubscriptionStatus);
  const plan = useSelector(selectSubscriptionPlan);
  const renewDate = useSelector(selectSubscriptionRenewDate);
  const loading = useSelector(selectSubscriptionLoading);
  const error = useSelector(selectSubscriptionError);
  const success = useSelector(selectSubscriptionSuccess);

  // deps: [dispatch] fetches the latest subscription snapshot from Redux on mount.
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  // deps: [error, success, dispatch] displays subscription messages and clears them after use.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSubscriptionMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearSubscriptionMessages());
    }
  }, [error, success, dispatch]);

  const handleSubscribe = async (selectedPlan) => {
    const result = await dispatch(createSubscription({ plan: selectedPlan }));

    if (createSubscription.fulfilled.match(result)) {
      dispatch(fetchCurrentUser());
      dispatch(fetchSubscriptionStatus());
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel?')) {
      return;
    }

    const result = await dispatch(cancelSubscription());

    if (cancelSubscription.fulfilled.match(result)) {
      dispatch(fetchSubscriptionStatus());
      dispatch(fetchCurrentUser());
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Subscription</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your current billing plan.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-white">Status: <strong className="capitalize">{status ?? 'inactive'}</strong></p>
        {plan ? <p className="text-zinc-300">Plan: {plan}</p> : null}
        {renewDate ? <p className="text-zinc-300">Renews: {new Date(renewDate).toLocaleDateString('en-GB')}</p> : null}

        {status !== 'active' ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
            >
              {loading ? 'Working...' : 'Subscribe Monthly'}
            </button>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 transition-colors hover:border-zinc-500 disabled:bg-zinc-800"
            >
              {loading ? 'Working...' : 'Subscribe Yearly'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-500 disabled:bg-zinc-700"
          >
            {loading ? 'Working...' : 'Cancel Subscription'}
          </button>
        )}
      </div>
    </div>
  );
}
