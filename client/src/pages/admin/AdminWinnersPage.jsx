import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetAdminWinnersQuery, useVerifyWinnerMutation } from '../../api/adminApi';

export default function AdminWinnersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const { data, isFetching: loading } = useGetAdminWinnersQuery({ limit: 50 });
  const [verifyWinnerRequest] = useVerifyWinnerMutation();
  const winners = data?.winners || data || [];

  const verifyWinner = async (drawId, winnerId) => {
    if(!window.confirm('Mark this winner as verified & paid?')) return;
    try {
      await verifyWinnerRequest({ drawId, winnerId }).unwrap();
      toast.success('Winner verified');
      setModalOpen(false);
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Winner Verifications</h1>
        <p className="text-zinc-500 mt-1">Review uploaded proof documents and process payouts.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
                 <tr>
                   <th className="px-6 py-4 font-semibold">Winner</th>
                   <th className="px-6 py-4 font-semibold">Draw Match</th>
                   <th className="px-6 py-4 font-semibold">Prize</th>
                   <th className="px-6 py-4 font-semibold">Status</th>
                   <th className="px-6 py-4 font-semibold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-200">
                 {loading ? (
                   <tr><td colSpan="5" className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
                 ) : winners.length === 0 ? (
                   <tr><td colSpan="5" className="py-12 text-center text-zinc-500">No pending winners.</td></tr>
                 ) : winners.map((w, idx) => (
                   <tr key={idx} className="hover:bg-zinc-50 transition">
                     <td className="px-6 py-4 font-medium text-zinc-900">
                       {w.userName || 'Unknown User'}
                       <br/>
                       <span className="text-xs text-zinc-500">{w.userEmail || w.userId}</span>
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant="inactive">{w.matchCount}-Match Tier</Badge>
                     </td>
                     <td className="px-6 py-4 font-bold text-emerald-600">${w.prizeAmount?.toLocaleString()}</td>
                     <td className="px-6 py-4">
                       {w.paymentStatus === 'paid' ? <Badge variant="paid">Verified & Paid</Badge> : <Badge variant="pending">Pending</Badge>}
                     </td>
                     <td className="px-6 py-4 text-right">
                       {w.proofUrl ? (
                         <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => { setSelectedProof(w); setModalOpen(true); }}>
                           <Eye size={16} className="mr-1.5"/> View Proof
                         </Button>
                       ) : (
                         <span className="text-xs text-zinc-400 italic">No proof uploaded</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Review Verification Proof">
        {selectedProof && (
          <div className="space-y-6">
             <div className="bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-zinc-200">
               <img src={selectedProof.proofUrl} alt="Proof" className="max-h-[50vh] object-contain rounded-lg shadow-sm" />
             </div>
             
             {selectedProof.paymentStatus !== 'paid' ? (
               <div className="flex gap-4">
                 <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white" onClick={() => verifyWinner(selectedProof.drawId, selectedProof.winnerId)}>
                  <CheckCircle size={18} className="mr-2"/> Approve & Mark Paid
                </Button>
               </div>
             ) : (
               <div className="text-center p-3 bg-emerald-50 text-emerald-700 rounded-lg font-semibold">
                 This user has already been verified and paid.
               </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
}
