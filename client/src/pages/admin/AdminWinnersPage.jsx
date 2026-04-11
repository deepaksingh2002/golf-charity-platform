import React from 'react';
import toast from 'react-hot-toast';
import { useGetWinnersListQuery, useVerifyWinnerMutation } from '../../store/api/adminApiSlice';
import { Trophy, CheckCircle, Clock, User, PoundSterling, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';

export default function AdminWinnersPage() {
  const { data: winnersResponse, isLoading, error } = useGetWinnersListQuery();
  const winners = normalizeApiList(winnersResponse, 'winners');
  const [verifyWinner, { isLoading: isVerifying }] = useVerifyWinnerMutation();

  const handleVerify = async (drawId, winnerId) => {
    if (!window.confirm('Mark this winner as verified and paid?')) return;
    
    try {
      await verifyWinner({ drawId, winnerId }).unwrap();
      toast.success('Winner verified successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to verify winner'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
        <AlertCircle size={20} />
        <div>
          <h3 className="font-bold">Error loading winners</h3>
          <p className="text-sm">{getApiErrorMessage(error, 'Please check your connection and permissions.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Trophy className="text-amber-500" />
          Winners & Payouts
        </h1>
        <p className="text-zinc-500 mt-1">Track and verify prize distributions across all draws.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {winners.length > 0 ? (
          winners.map((winner) => {
            const isVerified = winner.isVerified || winner.paymentStatus === 'paid';
            return (
              <Card key={`${winner.drawId}-${winner.winnerId}`} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900 text-lg">
                          {winner.userName || winner.userId?.name || 'Anonymous Winner'}
                        </h3>
                        <Badge variant={isVerified ? 'active' : 'inactive'}>
                          {isVerified ? 'Verified & Paid' : 'Pending Verification'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-500">
                        <div className="flex items-center gap-1">
                          <PoundSterling size={14} />
                          <span className="font-bold text-zinc-900">£{(winner.prizeAmount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy size={14} className="text-amber-500" />
                          <span>{winner.matchCount}-match Winner</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Draw Date: {winner.drawDate ? new Date(winner.drawDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    {!isVerified ? (
                      <Button 
                        onClick={() => handleVerify(winner.drawId, winner.winnerId || winner.userId?._id)}
                        loading={isVerifying}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Verify Payment
                      </Button>
                    ) : (
                      <div className="text-emerald-600 flex items-center gap-1 px-4 py-2 bg-emerald-50 rounded-lg font-medium border border-emerald-100">
                        <CheckCircle size={18} />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center border-dashed border-zinc-200">
            <Clock className="mx-auto text-zinc-300 mb-4" size={48} />
            <p className="text-zinc-500 font-medium">No winners recorded yet.</p>
            <p className="text-sm text-zinc-400 mt-1">Winners will appear here once draws are processed.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
