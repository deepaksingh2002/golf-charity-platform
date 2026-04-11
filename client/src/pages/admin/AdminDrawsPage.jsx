import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Send, Play, Plus, Clock, Users, Hash, Calendar, AlertCircle, CheckCircle2, FileUp, History } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { getApiErrorMessage, normalizeApiList } from '../../store/api/apiUtils';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { 
  useGetCurrentDrawQuery, 
  useGetDrawHistoryQuery,
  useCreateDrawMutation,
  useSimulateDrawMutation,
  usePublishDrawMutation,
  useUploadProofMutation
} from '../../store/api/drawApiSlice';

export default function AdminDrawsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { data: publishedDrawsResponse, isLoading: loadingHistory, error: historyError } = useGetDrawHistoryQuery({ page, limit: pageSize });
  const { data: activeDraft, isLoading: loadingActive, error: activeError } = useGetCurrentDrawQuery();
  const publishedDraws = normalizeApiList(publishedDrawsResponse, 'draws');
  const totalDraws = publishedDrawsResponse?.total ?? publishedDraws.length;
  const totalPages = publishedDrawsResponse?.pages ?? 1;

  const [createDraw, { isLoading: isCreating }] = useCreateDrawMutation();
  const [simulateDraw, { isLoading: isSimulating }] = useSimulateDrawMutation();
  const [publishDraw, { isLoading: isPublishing }] = usePublishDrawMutation();
  const [uploadProof, { isLoading: isUploading }] = useUploadProofMutation();

  useEffect(() => {
    if (historyError) toast.error(getApiErrorMessage(historyError, 'Failed to load publish history'));
    if (activeError) toast.error(getApiErrorMessage(activeError, 'Failed to load active draft'));
  }, [historyError, activeError]);

  useEffect(() => {
    setPage(1);
  }, []);

  const handleUploadProof = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('proof', file);

    try {
      await uploadProof({ id, body: formData }).unwrap();
      toast.success('Audit proof uploaded successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload proof'));
    }
  };

  const handleCreate = async () => {
    try {
      await createDraw({ drawType: 'random' }).unwrap();
      toast.success('New draw draft created successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create draw'));
    }
  };

  const handleSimulate = async () => {
    if (!activeDraft?._id) return toast.error('Create a draw first');
    try {
      await simulateDraw(activeDraft._id).unwrap();
      toast.success('Draw simulated successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to simulate draw'));
    }
  };

  const handlePublish = async () => {
    if (!activeDraft?._id) return toast.error('Simulate a draw first');
    if (activeDraft.status !== 'simulated') return toast.error('Draw must be simulated before publishing');
    if (!window.confirm('Are you sure you want to publish this draw? This will notify all winners and cannot be undone.')) return;

    try {
      await publishDraw(activeDraft._id).unwrap();
      toast.success('Draw published successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to publish draw'));
    }
  };

  if (activeError || historyError) {
    return (
      <EmptyState 
        icon={AlertCircle}
        title="Failed to load draw data"
        description="We encountered an error while fetching the current draw status or history."
        actionLabel="Retry Connection"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <Trophy className="text-violet-500" />
            Draw Management
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Create, simulate and publish monthly prize draws.</p>
        </div>
        {!activeDraft && !loadingActive && (
          <Button onClick={handleCreate} loading={isCreating} className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6">
            <Plus size={18} className="mr-2" />
            Initialize Monthly Draw
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Draw Panel */}
        <div className="lg:col-span-12">
          {loadingActive ? (
            <Card className="flex items-center justify-center h-64"><Spinner size="lg" /></Card>
          ) : activeDraft ? (
            <Card className="overflow-hidden border-violet-100 shadow-2xl shadow-violet-500/5">
              <div className="bg-violet-50/50 px-6 py-4 border-b border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900 leading-none">Current Active Draft</h2>
                    <p className="text-[10px] text-violet-600 mt-1 font-bold uppercase tracking-widest">{activeDraft.month}</p>
                  </div>
                </div>
                <Badge variant={activeDraft.status === 'simulated' ? 'paid' : 'active'} className="px-3 py-1 font-black">
                  {activeDraft.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Drawn Numbers</span>
                    {activeDraft.drawnNumbers?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activeDraft.drawnNumbers.map(n => (
                          <div key={n} className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-zinc-800">
                            {n}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">No numbers generated yet.</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-8 pt-4 border-t border-zinc-100">
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Phase</span>
                      <span className="text-sm font-bold text-zinc-900 capitalize">{activeDraft.status} mode</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Created</span>
                      <span className="text-sm font-bold text-zinc-900">{new Date(activeDraft.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex flex-col justify-center items-center text-center space-y-4">
                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-400 shadow-sm">
                      <Users size={24} />
                   </div>
                   <div>
                     <p className="text-3xl font-black text-zinc-900 tracking-tight">{activeDraft.participantCount ?? '0'}</p>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Eligible Members</p>
                   </div>
                   <p className="text-[10px] text-zinc-400 max-w-45 font-medium leading-relaxed italic">System generated from active subscriptions.</p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                   <Button 
                    onClick={handleSimulate} 
                    loading={isSimulating}
                    disabled={activeDraft.status === 'published'}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/10"
                   >
                     <Play size={18} className="mr-2" />
                     {activeDraft.status === 'simulated' ? 'Re-simulate Draw' : 'Simulate Draw Now'}
                   </Button>
                   <Button 
                    onClick={handlePublish} 
                    loading={isPublishing} 
                    disabled={activeDraft.status !== 'simulated'}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 font-bold"
                   >
                     <Send size={18} className="mr-2" />
                     Launch & Notify
                   </Button>
                </div>
              </div>
            </Card>
          ) : (
            <EmptyState 
              icon={Trophy}
              title="No active draw cycle"
              description="Ready to start the monthly prize draw? Initialize a new cycle to begin simulation."
              actionLabel="Start New Draw"
              onAction={handleCreate}
              className="py-24 border-dashed"
            />
          )}
        </div>

        {/* History Panel */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <History size={20} className="text-zinc-400" />
              Recent Publications
            </h3>
            <Badge variant="inactive" className="bg-zinc-100 text-zinc-500 font-bold uppercase text-[10px]">{publishedDraws.length} RECORDS</Badge>
          </div>
          
          {loadingHistory ? (
            <div className="flex py-12 justify-center"><Spinner /></div>
          ) : publishedDraws.length > 0 ? (
            <>
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                currentCount={publishedDraws.length}
                totalItems={totalDraws}
                itemLabel="draws"
                onPageChange={setPage}
                loading={loadingHistory}
                className="mb-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedDraws.map(draw => (
                  <Card key={draw._id} className="p-6 group hover:border-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-500/5">
                    <div className="flex items-center justify-between mb-6">
                      <Badge variant="paid" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black tracking-widest text-[10px]">PUBLISHED</Badge>
                      <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar size={12} />
                        {new Date(draw.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-black text-zinc-900 text-xl uppercase tracking-tight">{draw.month}</h4>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Participants</span>
                        <span className="font-black text-zinc-900">{draw.participantCount}</span>
                      </div>
                      <div>
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3 mt-4">Audit Results</span>
                         <div className="flex gap-2 flex-wrap">
                            {(draw.drawnNumbers ?? []).map(n => (
                              <div key={n} className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-900 flex items-center justify-center font-bold text-xs ring-1 ring-zinc-200">
                                {n}
                              </div>
                            ))}
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-6 mt-6 border-t border-zinc-100/50">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUploadProof(draw._id, e.target.files[0])}
                            disabled={isUploading}
                          />
                          <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors uppercase tracking-widest">
                            {isUploading ? <Spinner size="xs" /> : <FileUp size={14} />}
                            Upload Proof
                          </div>
                        </label>
                        {draw.winnersCount > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                             <CheckCircle2 size={12} />
                             {draw.winnersCount} NOTIFIED
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <EmptyState 
              icon={Hash}
              title="No publication history"
              description="All successfully completed and published draws will appear here for audit."
              className="bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
