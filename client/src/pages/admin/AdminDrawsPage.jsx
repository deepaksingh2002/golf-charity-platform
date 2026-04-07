import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetActiveDrawsQuery, 
  useGetDrawHistoryQuery,
  useCreateDrawMutation,
  useSimulateDrawMutation,
  usePublishDrawMutation
} from '../../store/api/drawApiSlice';
import { Trophy, Send, Play, Plus, Clock, Users, Hash, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export default function AdminDrawsPage() {
  const { data: publishedDrawsResponse, isLoading: loadingHistory, error: historyError } = useGetDrawHistoryQuery();
  const { data: activeDraft, isLoading: loadingActive, error: activeError } = useGetActiveDrawsQuery();
  const publishedDraws = Array.isArray(publishedDrawsResponse) ? publishedDrawsResponse : publishedDrawsResponse?.draws || [];

  const [createDraw, { isLoading: isCreating }] = useCreateDrawMutation();
  const [simulateDraw, { isLoading: isSimulating }] = useSimulateDrawMutation();
  const [publishDraw, { isLoading: isPublishing }] = usePublishDrawMutation();

  useEffect(() => {
    if (historyError) toast.error(historyError?.data?.message || 'Failed to load publish history');
    if (activeError) toast.error(activeError?.data?.message || 'Failed to load active draft');
  }, [historyError, activeError]);

  const handleCreate = async () => {
    try {
      await createDraw({ drawType: 'random' }).unwrap();
      toast.success('New draw draft created successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create draw');
    }
  };

  const handleSimulate = async () => {
    if (!activeDraft?._id) return toast.error('Create a draw first');
    try {
      await simulateDraw(activeDraft._id).unwrap();
      toast.success('Draw simulated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to simulate draw');
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
      toast.error(err?.data?.message || 'Failed to publish draw');
    }
  };

  if (activeError || historyError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-zinc-900">Failed to load draws</h2>
        <p className="text-zinc-500 mt-2">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Trophy className="text-violet-500" />
            Draw Management
          </h1>
          <p className="text-zinc-500 mt-1">Create, simulate and publish monthly prize draws.</p>
        </div>
        {!activeDraft && (
          <Button onClick={handleCreate} loading={isCreating} className="bg-violet-600 hover:bg-violet-700">
            <Plus size={18} className="mr-2" />
            Initialize New Draw
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Draw Panel */}
        <div className="lg:col-span-12">
          {loadingActive ? (
            <Card className="flex items-center justify-center h-64"><Spinner size="lg" /></Card>
          ) : activeDraft ? (
            <Card className="overflow-hidden border-violet-100 shadow-xl shadow-violet-500/5">
              <div className="bg-violet-50/50 px-6 py-4 border-b border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900 leading-none">Current Active Draft</h2>
                    <p className="text-xs text-violet-600 mt-1 font-semibold uppercase tracking-wider">{activeDraft.month}</p>
                  </div>
                </div>
                <Badge variant={activeDraft.status === 'simulated' ? 'paid' : 'inactive'} className="px-3 py-1">
                  {activeDraft.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Draw Numbers</span>
                    {activeDraft.drawnNumbers?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activeDraft.drawnNumbers.map(n => (
                          <div key={n} className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
                            {n}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">Not yet simulated</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-8 pt-4 border-t border-zinc-100">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Status</span>
                      <span className="text-sm font-semibold text-zinc-900 capitalize">{activeDraft.status}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Created At</span>
                      <span className="text-sm font-semibold text-zinc-900">{new Date(activeDraft.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 flex flex-col justify-center items-center text-center space-y-4">
                   <Users className="text-zinc-300" size={32} />
                   <div>
                     <p className="text-2xl font-bold text-zinc-900">{activeDraft.participantCount ?? 'Calculating...'}</p>
                     <p className="text-xs text-zinc-500 font-medium">Eligible Participants</p>
                   </div>
                   <p className="text-[10px] text-zinc-400 max-w-[180px]">Based on current active subscriptions for {activeDraft.month}.</p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                   <Button 
                    onClick={handleSimulate} 
                    loading={isSimulating}
                    disabled={activeDraft.status === 'published'}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                   >
                     <Play size={18} className="mr-2" />
                     {activeDraft.status === 'simulated' ? 'Re-simulate Draw' : 'Simulate Draw Now'}
                   </Button>
                   <Button 
                    onClick={handlePublish} 
                    loading={isPublishing} 
                    disabled={activeDraft.status !== 'simulated'}
                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100"
                   >
                     <Send size={18} className="mr-2" />
                     Publish Results
                   </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-16 text-center border-dashed border-zinc-200">
              <Plus className="mx-auto text-zinc-300 mb-4" size={48} />
              <p className="text-zinc-500 font-medium text-lg">No active draw draft</p>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">Click "Initialize New Draw" to start the process for the current period.</p>
              <Button onClick={handleCreate} loading={isCreating} variant="outline" className="mt-8">
                Initialize Monthly Draw
              </Button>
            </Card>
          )}
        </div>

        {/* History Panel */}
        <div className="lg:col-span-12 space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" />
            Publication History
          </h3>
          
          {loadingHistory ? (
            <div className="flex py-12 justify-center"><Spinner /></div>
          ) : publishedDraws.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedDraws.map(draw => (
                <Card key={draw._id} className="p-5 hover:border-violet-200 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="paid" className="bg-emerald-100 text-emerald-800 border-emerald-200">PUBLISHED</Badge>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(draw.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-lg uppercase">{draw.month}</h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 flex items-center gap-1.5"><Users size={14}/> Participants</span>
                      <span className="font-bold text-zinc-900">{draw.participantCount}</span>
                    </div>
                    <div>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Results</span>
                       <div className="flex gap-1.5 flex-wrap">
                          {(draw.drawnNumbers ?? []).map(n => (
                            <div key={n} className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-xs ring-1 ring-zinc-200">
                              {n}
                            </div>
                          ))}
                       </div>
                    </div>
                    {draw.winnersCount > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-50 text-xs font-bold text-emerald-600">
                         <CheckCircle2 size={14} />
                         {draw.winnersCount} Prize Winners Notified
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-2xl p-12 text-center border border-zinc-100">
               <Hash size={32} className="mx-auto text-zinc-200 mb-2" />
               <p className="text-sm text-zinc-400 italic">No published history available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
