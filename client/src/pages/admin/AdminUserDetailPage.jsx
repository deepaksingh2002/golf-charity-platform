import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  useGetUserDetailQuery, 
  useEditUserScoreMutation, 
  useManageUserSubscriptionMutation 
} from '../../store/api/adminApiSlice';
import { 
  User, Mail, Calendar, Shield, CreditCard, ArrowLeft, 
  Save, Edit2, Trash2, CheckCircle2, AlertCircle, TrendingUp 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: user, isLoading, error } = useGetUserDetailQuery(id);
  const [updateSubscription, { isLoading: isUpdatingSub }] = useManageUserSubscriptionMutation();
  const [editScore, { isLoading: isEditingScore }] = useEditUserScoreMutation();

  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreValue, setScoreValue] = useState('');

  const handleUpdateSub = async (status) => {
    try {
      await updateSubscription({ userId: id, subscriptionStatus: status }).unwrap();
      toast.success('Subscription updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update subscription');
    }
  };

  const handleEditScore = async (scoreId) => {
    if (!scoreValue || scoreValue < 1 || scoreValue > 45) {
      return toast.error('Please enter a valid score (1-45)');
    }

    try {
      await editScore({ userId: id, scoreId, value: Number(scoreValue) }).unwrap();
      toast.success('Score updated!');
      setEditingScoreId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update score');
    }
  };

  if (isLoading) return <div className="flex justify-center p-24"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
      <AlertCircle className="mx-auto mb-4" size={48} />
      <h2 className="text-xl font-bold">User Not Found</h2>
      <p className="mt-2">The user you are looking for does not exist or you don't have permission to view them.</p>
      <Button onClick={() => navigate('/admin/users')} variant="outline" className="mt-6">Back to Users</Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-zinc-900 leading-none">Member Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-xl shadow-emerald-500/20">
              {user.name?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">{user.name}</h2>
            <p className="text-zinc-500 flex items-center justify-center gap-2 mt-1">
              <Mail size={14} /> {user.email}
            </p>
            <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4">
              <div className="text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Joined</span>
                <span className="text-sm font-semibold text-zinc-900">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Role</span>
                <Badge variant={user.role === 'admin' ? 'paid' : 'active'} className="lowercase">
                  {user.role}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-500" />
              Subscription Control
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 uppercase font-bold text-[10px] tracking-wider">Current Status</span>
                <Badge variant={user.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
                  {user.subscriptionStatus || 'inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {user.subscriptionStatus === 'active' ? (
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                    onClick={() => handleUpdateSub('inactive')}
                    loading={isUpdatingSub}
                  >
                    Pause Subscription
                  </Button>
                ) : (
                  <Button 
                    variant="active" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleUpdateSub('active')}
                    loading={isUpdatingSub}
                  >
                    Activate Subscription
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 text-center italic">Manually overriding subscription status will take effect immediately.</p>
            </div>
          </Card>
        </div>

        {/* Scores & Activity Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-violet-500" />
                Stableford Score History
              </h3>
              <Badge variant="active" className="bg-zinc-900 text-white border-zinc-900">{user.scores?.length || 0} Records</Badge>
            </div>
            
            <div className="divide-y divide-zinc-50 min-h-[300px]">
              {user.scores && user.scores.length > 0 ? (
                user.scores.map((score) => (
                  <div key={score._id} className="p-6 flex items-center justify-between group hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 flex flex-col items-center justify-center border border-violet-100 group-hover:scale-110 transition-transform">
                        <span className="text-lg font-bold text-violet-700 leading-none">{score.value}</span>
                        <span className="text-[8px] font-bold text-violet-400 uppercase mt-1">PTS</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Stableford Score</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                          <Calendar size={12} /> {new Date(score.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingScoreId === score._id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            className="w-16 h-9 py-1 px-2 text-center font-bold"
                            value={scoreValue}
                            onChange={(e) => setScoreValue(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleEditScore(score._id)} loading={isEditingScore}>
                            <Save size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingScoreId(null)}>
                            <Trash2 size={14} className="text-zinc-400" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setEditingScoreId(score._id);
                            setScoreValue(score.value);
                          }}
                        >
                          <Edit2 size={14} className="mr-2" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-400 space-y-4">
                   <AlertCircle size={40} className="text-zinc-200" />
                   <p className="font-medium">No score history for this user.</p>
                </div>
              )}
            </div>
          </Card>

          <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Shield size={120} />
             </div>
             <div className="relative z-10 space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                  Security Audit Trail
                </h3>
                <p className="text-zinc-400 text-sm max-w-md">
                  All administrative changes to this user's profile, subscription, or scores are logged and immutable for audit purposes.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
