import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  useCreateDrawMutation,
  usePublishDrawMutation,
  useSimulateDrawMutation,
} from '../../api/adminApi';
import { useGetCurrentDrawQuery } from '../../api/drawApi';

export default function AdminDrawsPage() {
  const [processing, setProcessing] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState('');
  const { data, isFetching: loading, error: queryError, refetch } = useGetCurrentDrawQuery();
  const [createDraw] = useCreateDrawMutation();
  const [simulateDraw] = useSimulateDrawMutation();
  const [publishDraw] = usePublishDrawMutation();
  const currentDraw = data?.draw || null;

  useEffect(() => {
    if (currentDraw?.status === 'simulated') {
      setSimulation(currentDraw);
    } else if (!processing) {
      setSimulation(null);
    }
  }, [currentDraw, processing]);

  useEffect(() => {
    if (!queryError || queryError.status === 404) {
      setError('');
      return;
    }

    setError(queryError?.data?.message || 'Failed to load current draw.');
  }, [queryError]);

  const handleCreateDraw = async () => {
    setProcessing(true);
    try {
      await createDraw({ forced: true }).unwrap();
      toast.success('Draw doc forced creation');
      await refetch();
    } catch (err) {
      toast.error('Draw creation failed or already exists');
    } finally {
      setProcessing(false);
    }
  };

  const runSimulation = async () => {
    setProcessing(true);
    try {
      const res = await simulateDraw('current').unwrap();
      setSimulation(res);
      toast.success('Simulation complete');
    } catch (err) {
      toast.error('Simulation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if(!window.confirm('Are you sure you want to PUBLISH this draw? This cannot be undone.')) return;
    setProcessing(true);
    try {
      await publishDraw('current').unwrap();
      toast.success('Draw published successfully!');
      setSimulation(null);
      await refetch();
    } catch (err) {
      toast.error('Failed to publish');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Draw Management</h1>
        <p className="text-zinc-500 mt-1">Configure, simulate, and publish manual overrides for the algorithmic core.</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-brand-200">
          <CardHeader>
            <CardTitle>Current Month Draw Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-zinc-600">The monthly draw usually runs automatically via cron on the 1st. Use these controls to force behavior.</p>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              {currentDraw ? (
                <div className="grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Month</p>
                    <p className="mt-1 font-semibold text-zinc-900">{currentDraw.month}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
                    <p className="mt-1 font-semibold capitalize text-zinc-900">{currentDraw.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</p>
                    <p className="mt-1 font-semibold capitalize text-zinc-900">{currentDraw.drawType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Participants</p>
                    <p className="mt-1 font-semibold text-zinc-900">{currentDraw.participantCount || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No draft draw exists yet for the current cycle. Create one to begin simulation.</p>
              )}
            </div>
            
            <div className="flex gap-4 border-t border-zinc-100 pt-6">
              <Button variant="secondary" onClick={handleCreateDraw} disabled={processing} className="cursor-pointer">
                 Init Draw Doc
              </Button>
              <Button onClick={runSimulation} disabled={processing} className="bg-violet-600 hover:bg-violet-700 cursor-pointer">
                 Run Simulation
              </Button>
            </div>
            <p className="text-xs text-zinc-400">Simulation does not mutate database records for users or save the draw numbers permanently.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Simulation Preview</CardTitle>
          </CardHeader>
          <CardContent>
             {simulation ? (
               <div className="space-y-4">
                 <div>
                   <p className="text-sm font-semibold text-zinc-500">Drawn Numbers</p>
                   <div className="flex gap-2 mt-2">
                     {simulation.drawnNumbers?.map((n, i) => (
                       <div key={i} className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                         {n}
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Jackpot Winners (5-Match)</p>
                      <p className="text-2xl font-bold text-violet-600">{simulation.winners?.filter(w => w.matchCount === 5).length || 0}</p>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Winners</p>
                      <p className="text-2xl font-bold text-zinc-900">{simulation.winners?.length || 0}</p>
                    </div>
                 </div>
                 <Button className="w-full mt-4 bg-emerald-600 cursor-pointer" onClick={handlePublish}>
                    Publish Draw to Production
                 </Button>
               </div>
             ) : (
               <div className="text-center py-8 text-zinc-500">Run a simulation to preview payouts without publishing.</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
