import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminDrawsPage() {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [drawModal, setDrawModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
       await adminApi.getDashboardStats(); // ensures auth config
       setLoading(false);
    } catch (err) {
       setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDraw = async () => {
    setProcessing(true);
    try {
      await adminApi.createDraw({ forced: true });
      toast.success('Draw doc forced creation');
    } catch (err) {
      toast.error('Draw creation failed or already exists');
    } finally {
      setProcessing(false);
    }
  };

  const runSimulation = async () => {
    setProcessing(true);
    try {
      const res = await adminApi.simulateDraw('current'); 
      setSimulation(res.data);
      setDrawModal(true);
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
      await adminApi.publishDraw('current');
      toast.success('Draw published successfully!');
      setDrawModal(false);
    } catch (err) {
      toast.error('Failed to publish');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Draw Management</h1>
        <p className="text-zinc-500 mt-1">Configure, simulate, and publish manual overrides for the algorithmic core.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-brand-200">
          <CardHeader>
            <CardTitle>Current Month Draw Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-zinc-600">The monthly draw usually runs automatically via cron on the 1st. Use these controls to force behavior.</p>
            
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
