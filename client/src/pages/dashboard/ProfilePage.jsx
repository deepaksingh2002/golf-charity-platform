import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { User, Mail, Shield, Heart, Percent, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export default function ProfilePage() {
  const user = useSelector(selectUser);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Your Profile</h1>
        <p className="text-zinc-500 mt-1">Manage your account and charity preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Info */}
        <Card className="md:col-span-2 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <User size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">{user.name}</h2>
                <div className="flex items-center gap-2 text-zinc-500 mt-1">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <Badge variant={user.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
              {user.subscriptionStatus === 'active' ? 'Active Subscriber' : 'Inactive'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
            <div className="space-y-1">
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Account Role</span>
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <Shield size={18} className="text-violet-500" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Member Since</span>
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <Calendar size={18} className="text-blue-500" />
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Charity Preferences */}
        <Card className="p-8 bg-zinc-950 text-white border-zinc-800">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Heart size={20} className="text-emerald-500" />
            Charity Focus
          </h3>
          <div className="space-y-6">
            <div>
              <span className="text-sm text-zinc-400">Selected Charity</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {user.selectedCharity?.name || 'No charity selected'}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-400">Donation Percentage</span>
              <div className="flex items-center gap-2 mt-1">
                <Percent size={18} className="text-zinc-500" />
                <span className="text-2xl font-bold">{user.charityPercentage || 10}%</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                This percentage of your winnings will be donated to your selected charity.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
