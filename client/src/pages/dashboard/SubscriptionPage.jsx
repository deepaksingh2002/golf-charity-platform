import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetSubscriptionStatusQuery, useCreateCheckoutSessionMutation, useCancelSubscriptionMutation } from '../../store/api/subscriptionApiSlice';
import { useGetMeQuery } from '../../store/api/authApiSlice';

export default function SubscriptionPage() {
  const { data: subData, isLoading: loadingStatus, error: statusError } = useGetSubscriptionStatusQuery();
  const { refetch: refetchUser } = useGetMeQuery();
  const [createCheckoutSession, { isLoading: isCreating }] = useCreateCheckoutSessionMutation();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();

  const loading = loadingStatus || isCreating || isCanceling;
  
  const status = subData?.status;
  const plan = subData?.planId;
  const renewDate = subData?.currentPeriodEnd;

  useEffect(() => {
    if (statusError) {
      toast.error(statusError?.data?.message || 'Failed to fetch subscription data');
    }
  }, [statusError]);

  const handleSubscribe = async (selectedPlan) => {
    try {
      const { url } = await createCheckoutSession(selectedPlan).unwrap();
      if (url) {
        window.location.href = url; // Redirect to Stripe checkout
      } else {
        refetchUser(); // if handled internally
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to start checkout');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel?')) return;

    try {
      await cancelSubscription().unwrap();
      toast.success('Subscription cancelled successfully');
      refetchUser();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel subscription');
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
