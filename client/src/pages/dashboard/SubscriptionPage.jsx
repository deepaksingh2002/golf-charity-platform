import React, { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
} from '../../api/subscriptionApi';
import { useLazyGetMeQuery } from '../../api/authApi';
import { selectCurrentUser, updateUser } from '../../store/authSlice';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const PaymentForm = ({ clientSecret, planLabel, onSuccess, onCancel, processing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message || 'Payment confirmation failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await onSuccess();
        return;
      }

      toast.success('Payment submitted. Waiting for Stripe to finish processing.');
      await onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <PaymentElement />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={!stripe || !elements || submitting || processing}>
          {submitting ? 'Confirming Payment...' : `Pay for ${planLabel}`}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting || processing}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState('');
  const [pendingPlan, setPendingPlan] = useState('');
  const {
    data: subData,
    isFetching: loading,
    refetch: refetchStatus,
  } = useGetSubscriptionStatusQuery();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [subscribe] = useSubscribeMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  const refreshUserFromBackend = async () => {
    const freshUser = await triggerGetMe().unwrap();
    dispatch(updateUser(freshUser));
    return freshUser;
  };

  const handleSubscribe = async (plan) => {
    setIsProcessing(true);
    try {
      const res = await subscribe({ plan }).unwrap();

      if (res?.mocked) {
        await refreshUserFromBackend();
        await refetchStatus();
        toast.success('Subscription activated!');
        return;
      }

      if (!res?.clientSecret) {
        throw new Error('Stripe did not return a client secret. Check backend Stripe env vars.');
      }

      setPendingPlan(res.plan || plan);
      setPaymentClientSecret(res.clientSecret);
      toast.success('Payment form ready. Complete the card details below.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSubscription = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    let latestUser = await refreshUserFromBackend();
    let latestStatus = await refetchStatus().unwrap();

    if (latestUser?.subscriptionStatus !== 'active' && latestStatus?.status !== 'active') {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        latestUser = await refreshUserFromBackend();
        latestStatus = await refetchStatus().unwrap();
        if (latestUser?.subscriptionStatus === 'active' || latestStatus?.status === 'active') {
          break;
        }
      }
    }

    setPaymentClientSecret('');
    setPendingPlan('');

    const resolvedStatus = latestStatus?.status === 'active' ? 'active' : latestUser?.subscriptionStatus;
    if (resolvedStatus === 'active') {
      toast.success('Subscription activated!');
    } else {
      toast.success('Payment completed. Waiting for webhook confirmation.');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? This will forfeit future draws.')) return;
    setIsProcessing(true);
    try {
      await cancelSubscription().unwrap();
      toast.success('Subscription cancelled');
      await refetchStatus();
      dispatch(updateUser({ ...user, subscriptionStatus: 'cancelled' }));
    } catch (err) {
      toast.error('Cancellation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  const displayStatus = subData?.status || user?.subscriptionStatus || 'inactive';
  const displayPlan = subData?.subscriptionPlan || user?.subscriptionPlan;
  const displayRenewDate = subData?.renewDate || user?.subscriptionRenewDate;
  const isActive = displayStatus === 'active';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Subscription</h1>
        <p className="text-zinc-500 mt-1">Manage your billing and tier to stay eligible for draws.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-100 pb-4">
          <div className="flex justify-between items-center">
             <CardTitle>Current Plan</CardTitle>
             <Badge variant={isActive ? 'active' : 'inactive'}>
               {displayStatus.toUpperCase()}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isActive ? (
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-zinc-500">Plan Type</span>
                <span className="text-lg font-semibold text-zinc-900 capitalize">{displayPlan || 'Monthly'} Subscription</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-zinc-500">Renewal Date</span>
                <span className="text-lg font-semibold text-zinc-900">
                  {displayRenewDate ? new Date(displayRenewDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex gap-4">
                <Button variant="danger" onClick={handleCancel} disabled={isProcessing}>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-600 mb-6 max-w-md mx-auto">
                You currently do not have an active subscription. Subscribe now to support your chosen charity and enter the monthly draw!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => handleSubscribe('monthly')} disabled={isProcessing}>
                  Subscribe Monthly ($25/mo)
                </Button>
                <Button variant="secondary" onClick={() => handleSubscribe('yearly')} disabled={isProcessing}>
                  Subscribe Yearly ($250/yr)
                </Button>
              </div>
              
              <div className="mt-8">
                {paymentClientSecret ? (
                  stripePromise ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: paymentClientSecret,
                        appearance: {
                          theme: 'stripe'
                        }
                      }}
                    >
                      <PaymentForm
                        clientSecret={paymentClientSecret}
                        planLabel={pendingPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                        onSuccess={finalizeSubscription}
                        onCancel={() => {
                          setPaymentClientSecret('');
                          setPendingPlan('');
                        }}
                        processing={isProcessing}
                      />
                    </Elements>
                  ) : (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                      Stripe publishable key is missing. Set `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel.
                    </div>
                  )
                ) : (
                  <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-500 border-dashed">
                    Choose a plan to load the secure Stripe payment form.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
