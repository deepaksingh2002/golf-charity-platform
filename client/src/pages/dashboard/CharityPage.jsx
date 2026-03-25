import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { charityApi } from '../../api/charity.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function CharityPage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [charities, setCharities] = useState([]);
  const [percentage, setPercentage] = useState(user?.charityPercentage || 10);

  useEffect(() => {
    fetchProfile();
    charityApi.getCharities({ limit: 50 }).then(res => setCharities(res.data)).catch(console.error);
  }, []);

  const fetchProfile = () => {
    authApi.getMe().then(res => {
      setProfile(res.data);
      setUser(res.data);
      setPercentage(res.data.charityPercentage || 10);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const savePercentage = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ charityPercentage: Number(percentage) });
      toast.success('Contribution updated');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const changeCharity = async (id) => {
    try {
      await authApi.updateProfile({ selectedCharity: id });
      toast.success('Charity selected!');
      setModalOpen(false);
      fetchProfile();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Supported Charity</h1>
        <p className="text-zinc-500 mt-1">Manage where your direct platform contributions go.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Currently Supporting</CardTitle>
          </CardHeader>
          <CardContent>
             {profile?.selectedCharity ? (
               <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                 <img 
                   src={profile.selectedCharity.imageUrl || 'https://images.unsplash.com/photo-1593113511475-680f4f9547d5?w=400'} 
                   className="w-32 h-32 object-cover rounded-xl shadow-sm"
                   alt="Charity"
                 />
                 <div>
                   <h3 className="text-xl font-bold text-zinc-900">{profile.selectedCharity.name}</h3>
                   <p className="text-zinc-500 text-sm mt-2 line-clamp-3">{profile.selectedCharity.description}</p>
                   <Button variant="secondary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
                     Change Charity
                   </Button>
                 </div>
               </div>
             ) : (
               <div className="text-center py-6">
                 <p className="text-zinc-500 mb-4">You haven't selected a charity to support yet.</p>
                 <Button onClick={() => setModalOpen(true)}>Browse Charities</Button>
               </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Tuning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 mb-6">
              Adjust how much of your base subscription (after platform fees and prize pool) goes to your chosen charity. Minimum 10%.
            </p>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-zinc-700">Allocation</span>
                  <span className="font-bold text-emerald-600">{percentage}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={percentage} 
                  onChange={e => setPercentage(e.target.value)} 
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                  <span>10% (Min)</span><span>100%</span>
                </div>
              </div>
              <Button onClick={savePercentage} disabled={saving || percentage === profile?.charityPercentage} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Select a Charity to Support">
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
          {charities.map(c => (
            <div key={c._id} className="flex justify-between items-center p-4 border border-zinc-200 rounded-lg hover:border-brand-300 transition-colors">
              <div className="font-semibold">{c.name}</div>
              <Button size="sm" variant="ghost" className="text-brand-600" onClick={() => changeCharity(c._id)}>
                Select
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
