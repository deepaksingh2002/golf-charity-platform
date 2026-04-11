import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetSubscriptionStatusQuery, useSubscribeMutation, useCancelSubscriptionMutation } from '../../store/api/subscriptionApiSlice';
import { useGetMeQuery } from '../../store/api/authApiSlice';
import { getApiErrorMessage } from '../../store/api/apiUtils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Spinner } from '../../components/ui/Spinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const formatRenewDate = (value) => {
  if (!value) return null;

  const date = typeof value === 'number' && value < 10_000_000_000
    ? new Date(value * 1000)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const PaymentForm = ({ onSuccess, onCancel, planLabel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentError('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Payment confirmation failed');
      setProcessing(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">Complete your {planLabel} subscription</p>
        <p className="text-sm text-zinc-400">Enter your payment details to activate the plan.</p>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
        <PaymentElement />
      </div>

      {paymentError ? <p className="text-sm text-red-400">{paymentError}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 transition-colors hover:border-zinc-500 disabled:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700"
        >
          {processing ? 'Processing...' : 'Pay now'}
        </button>
      </div>
    </form>
  );
};

export default function SubscriptionPage() {
  const { data: subData, isLoading: loadingStatus, error: statusError } = useGetSubscriptionStatusQuery();
  const { refetch: refetchUser } = useGetMeQuery();
  const [subscribe, { isLoading: isCreating }] = useSubscribeMutation();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [clientSecret, setClientSecret] = useState('');
  const [pendingPlan, setPendingPlan] = useState('');

  const loading = loadingStatus || isCreating || isCanceling;
  
  const status = subData?.status;
  const plan = subData?.subscriptionPlan;
  const renewDate = formatRenewDate(subData?.renewDate ?? subData?.stripeData?.current_period_end);

  useEffect(() => {
    if (statusError) {
      toast.error(getApiErrorMessage(statusError, 'Failed to fetch subscription data'));
    }
  }, [statusError]);

  const handleSubscribe = async (selectedPlan) => {
    try {
      const result = await subscribe(selectedPlan).unwrap();

      if (result?.clientSecret) {
        setPendingPlan(result.plan || selectedPlan);
        setClientSecret(result.clientSecret);
        toast.success('Payment form loaded. Complete checkout below.');
      } else {
        toast.success(result?.mocked
          ? `Subscription activated for ${result?.plan || selectedPlan}.`
          : `Subscription session created for ${result?.plan || selectedPlan}.`
        );
        refetchUser();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to start checkout'));
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Subscription payment completed successfully.');
    setClientSecret('');
    setPendingPlan('');
    refetchUser();
  };

  const handlePaymentCancel = () => {
    setClientSecret('');
    setPendingPlan('');
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel?')) return;

    try {
      await cancelSubscription().unwrap();
      toast.success('Subscription cancelled successfully');
      refetchUser();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel subscription'));
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

        {clientSecret ? (
          <div className="pt-2">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                },
              }}
            >
              <PaymentForm
                planLabel={pendingPlan || 'selected'}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </div>
        ) : status !== 'active' ? (
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
