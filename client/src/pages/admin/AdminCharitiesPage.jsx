import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetCharitiesQuery, 
  useCreateCharityMutation, 
  useUpdateCharityMutation, 
  useDeleteCharityMutation, 
  useToggleFeaturedMutation 
} from '../../store/api/charityApiSlice';
import { Heart, Globe, Plus, Edit2, Trash2, Star, AlertCircle, Save, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export default function AdminCharitiesPage() {
  const { data: charitiesResponse, isLoading, error } = useGetCharitiesQuery();
  const charities = Array.isArray(charitiesResponse) ? charitiesResponse : charitiesResponse?.charities || [];
  const [createCharity, { isLoading: isCreating }] = useCreateCharityMutation();
  const [updateCharity, { isLoading: isUpdating }] = useUpdateCharityMutation();
  const [deleteCharity] = useDeleteCharityMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();

  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const [editingId, setEditingId] = useState('');

  const resetForm = () => {
    setFormData({ name: '', description: '', website: '' });
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name) return toast.error('Name is required');

    try {
      if (editingId) {
        await updateCharity({ id: editingId, data: formData }).unwrap();
        toast.success('Charity updated!');
      } else {
        await createCharity(formData).unwrap();
        toast.success('Charity created!');
      }
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charity?')) return;
    try {
      await deleteCharity(id).unwrap();
      toast.success('Charity deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeatured(id).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-center gap-3">
        <AlertCircle size={20} />
        <div>
          <h3 className="font-bold">Error loading charities</h3>
          <p className="text-sm">{error?.data?.message || 'Please check your connection and permissions.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Heart className="text-emerald-500" />
            Charity Partners
          </h1>
          <p className="text-zinc-500 mt-1">Manage partner organizations and donation recipients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900">
              {editingId ? <Edit2 size={18} className="text-violet-500" /> : <Plus size={18} className="text-emerald-500" />}
              {editingId ? 'Edit Charity' : 'Add New Charity'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Name</label>
                <Input
                  placeholder="Charity Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Website</label>
                <Input
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <textarea
                  placeholder="Tell us about this charity..."
                  className="w-full min-h-[120px] rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" loading={isCreating || isUpdating}>
                  <Save size={18} className="mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
                {editingId && (
                  <Button variant="outline" type="button" onClick={resetForm}>
                    <X size={18} />
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex py-24 justify-center items-center">
              <Spinner size="lg" />
            </div>
          ) : charities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {charities.map((charity) => (
                <Card key={charity._id} className="p-6 group relative overflow-hidden">
                  {charity.isFeatured && (
                    <div className="absolute top-0 right-0 py-1 px-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl shadow-sm">
                      Featured
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-zinc-900 text-lg leading-none">{charity.name}</h3>
                        {charity.isFeatured && <Star size={16} className="text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
                        <Globe size={14} />
                        <a href={charity.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {charity.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                      <p className="mt-3 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                        {charity.description}
                      </p>
                    </div>
                    <div className="flex items-center sm:flex-col gap-2 shrink-0 sm:border-l sm:pl-4 border-zinc-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:w-full"
                        onClick={() => {
                          setEditingId(charity._id);
                          setFormData({
                            name: charity.name,
                            description: charity.description,
                            website: charity.website,
                          });
                        }}
                      >
                        <Edit2 size={14} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 sm:w-full"
                        onClick={() => handleToggleFeatured(charity._id)}
                      >
                        <Star size={14} className={`mr-2 ${charity.isFeatured ? 'text-amber-500 fill-amber-500' : ''}`} />
                        {charity.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 sm:w-full bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                        onClick={() => handleDelete(charity._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-zinc-200">
              <Heart className="mx-auto text-zinc-300 mb-4" size={48} />
              <p className="text-zinc-500 font-medium">No charities found.</p>
              <p className="text-sm text-zinc-400 mt-1">Start by adding your first charity partner.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
