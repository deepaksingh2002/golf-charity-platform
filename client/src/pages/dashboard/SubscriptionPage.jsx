import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { subscriptionApi } from '../../api/subscription.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStatus = () => {
    subscriptionApi.getStatus()
      .then(res => { setSubData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const res = await subscriptionApi.subscribe('price_monthly_mock'); 
      toast.success('Subscription initiated. Complete payment in Stripe module.');
    } catch (err) {
      toast.error('Subscription failed setup');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? This will forfeit future draws.')) return;
    setIsProcessing(true);
    try {
      await subscriptionApi.cancel();
      toast.success('Subscription cancelled');
      fetchStatus();
      setUser({ ...user, subscriptionStatus: 'cancelled' });
    } catch (err) {
      toast.error('Cancellation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  const isActive = user?.subscriptionStatus === 'active';

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
               {user?.subscriptionStatus?.toUpperCase()}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isActive ? (
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-zinc-500">Plan Type</span>
                <span className="text-lg font-semibold text-zinc-900 capitalize">{user.subscriptionPlan || 'Monthly'} Subscription</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-zinc-500">Renewal Date</span>
                <span className="text-lg font-semibold text-zinc-900">
                  {user.subscriptionRenewDate ? new Date(user.subscriptionRenewDate).toLocaleDateString() : 'N/A'}
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
                <Button onClick={handleSubscribe} disabled={isProcessing}>
                  Subscribe Monthly ($25/mo)
                </Button>
                <Button variant="secondary" onClick={handleSubscribe} disabled={isProcessing}>
                  Subscribe Yearly ($250/yr)
                </Button>
              </div>
              
              <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-400 border-dashed">
                [ Stripe Custom Payment Flow Appears Here ]
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
