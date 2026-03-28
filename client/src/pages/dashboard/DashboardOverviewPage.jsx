import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Target, Trophy, HeartHandshake, CreditCard } from 'lucide-react';

export default function DashboardOverviewPage() {
  const user = useAuthStore(state => state.user);
  const profile = user;

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-zinc-500 mt-1">Here is a summary of your account activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600"><CreditCard size={20}/></div>
            </div>
            <h3 className="text-zinc-500 text-sm font-medium">Subscription</h3>
            <div className="mt-1">
              <Badge variant={profile.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
                {profile.subscriptionStatus?.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-brand-100 rounded-lg text-brand-600"><Target size={20}/></div>
            </div>
            <h3 className="text-zinc-500 text-sm font-medium">Recorded Scores</h3>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{profile.scores?.length || 0} / 5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-violet-100 rounded-lg text-violet-600"><Trophy size={20}/></div>
            </div>
            <h3 className="text-zinc-500 text-sm font-medium">Total Winnings</h3>
            <p className="text-2xl font-bold text-zinc-900 mt-1">${profile.totalWinnings?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><HeartHandshake size={20}/></div>
            </div>
            <h3 className="text-zinc-500 text-sm font-medium">Supported Charity</h3>
            <p className="text-base font-bold text-zinc-900 mt-1 truncate">
              {profile.selectedCharity?.name || 'None selected'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
             <CardTitle>Recent Scores</CardTitle>
          </CardHeader>
          <CardContent>
             {profile.scores && profile.scores.length > 0 ? (
               <div className="space-y-3">
                 {[...profile.scores].reverse().slice(0,3).map(score => (
                   <div key={score._id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                     <span className="font-semibold text-zinc-800">Score: {score.value}</span>
                     <span className="text-sm text-zinc-500">{new Date(score.date).toLocaleDateString()}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-zinc-500 text-sm">No scores submitted yet.</p>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Next Draw Countdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
             <div className="w-32 h-32 rounded-full border-4 border-dashed border-brand-200 flex items-center justify-center bg-brand-50/50">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-brand-600">1st</span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Next Month</span>
                </div>
             </div>
             <p className="text-center mt-6 text-sm text-zinc-600 max-w-xs mx-auto">Make sure you have exactly 5 scores entered to automatically participate.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
