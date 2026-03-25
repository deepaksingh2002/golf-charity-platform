import React, { useEffect } from 'react';
import { useDrawStore } from '../../store/drawStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/authStore';

export default function DrawPage() {
  const { currentDraw, publishedDraws, fetchDraws, isLoading } = useDrawStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>;

  const isEligible = currentDraw?.userParticipationStatus?.isEligible;
  const userScores = user?.scores?.map(s => s.value) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Draw Results</h1>
        <p className="text-zinc-500 mt-1">Track current draws and see whether you match the winning numbers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-violet-200 bg-violet-50/30">
          <CardHeader>
            <CardTitle>Current Month Draw</CardTitle>
          </CardHeader>
          <CardContent>
            {currentDraw?.draw ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Prize Pool Setup</h3>
                  <div className="text-3xl font-extrabold text-violet-700 mt-1">
                    ${currentDraw.draw.prizePool?.total?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-violet-100 flex items-center justify-between">
                  <span className="font-medium text-zinc-700">Participation Status</span>
                  {isEligible ? (
                     <Badge variant="active">Eligible for Draw</Badge>
                  ) : (
                     <Badge variant="pending">Not Eligible</Badge>
                  )}
                </div>
                {!isEligible && (
                  <p className="text-xs text-rose-600">You must have an active subscription and exactly 5 scores entered to participate.</p>
                )}
              </div>
            ) : (
              <p className="text-zinc-500">No active draw running currently.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Entry Card</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-zinc-500 mt-[-8px] mb-4">Your current rolling 5 scores act as your draw numbers.</p>
             {userScores.length === 5 ? (
               <div className="flex justify-between items-center gap-2">
                 {userScores.map((sc, i) => (
                   <div key={i} className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg border-2 border-brand-200">
                     {sc}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center p-6 border border-dashed border-zinc-300 rounded-lg">
                 <p className="text-zinc-500 text-sm">
                   Need 5 scores to form an entry. Currently have {userScores.length}.
                 </p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">History of Results</h2>
        {publishedDraws.length > 0 ? (
          <div className="space-y-4">
            {publishedDraws.map(draw => {
              const myWin = draw.winners?.find(w => w.userId === user?._id);
              return (
                <Card key={draw._id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900">{draw.month} Draw</h4>
                      <p className="text-sm text-zinc-500">Drawn on: {new Date(draw.publishedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                       {draw.drawnNumbers.map((n, i) => (
                         <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${userScores.includes(n) ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                           {n}
                         </div>
                       ))}
                    </div>
                    <div className="text-right min-w-[120px]">
                      {myWin ? (
                        <div className="flex flex-col items-end">
                          <Badge variant="paid" className="mb-1">WINNER!</Badge>
                          <span className="font-bold text-emerald-600">+${myWin.prizeAmount.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400 font-medium">No match</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-500 italic">No published draws yet.</p>
        )}
      </div>
    </div>
  );
}
