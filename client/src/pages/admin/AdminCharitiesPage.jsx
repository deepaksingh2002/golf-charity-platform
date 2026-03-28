import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Trash2, Edit, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateCharityMutation,
  useDeleteCharityMutation,
  useToggleFeaturedCharityMutation,
  useUpdateCharityMutation,
} from '../../api/admin.api';
import { useGetCharitiesQuery } from '../../api/charity.api';

export default function AdminCharitiesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', website: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { data: charities = [], isFetching: loading } = useGetCharitiesQuery({ limit: 100 });
  const [toggleFeaturedRequest] = useToggleFeaturedCharityMutation();
  const [deleteCharityRequest] = useDeleteCharityMutation();
  const [createCharityRequest] = useCreateCharityMutation();
  const [updateCharityRequest] = useUpdateCharityMutation();

  const toggleFeatured = async (id) => {
    try {
      await toggleFeaturedRequest(id).unwrap();
      toast.success('Featured status toggled');
    } catch (err) {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Soft delete this charity?')) return;
    try {
      await deleteCharityRequest(id).unwrap();
      toast.success('Charity deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await updateCharityRequest({ id: editingId, ...formData }).unwrap();
        toast.success('Charity updated');
      } else {
        await createCharityRequest(formData).unwrap();
        toast.success('Charity created');
      }
      setModalOpen(false);
      setFormData({ name: '', description: '', website: '' });
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      toast.error(isEditing ? 'Update failed' : 'Creation failed');
    }
  };

  const openCreate = () => {
    setFormData({ name: '', description: '', website: '' });
    setIsEditing(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (charity) => {
    setFormData({ name: charity.name || '', description: charity.description || '', website: charity.website || '' });
    setIsEditing(true);
    setEditingId(charity._id);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Charity Directory</h1>
          <p className="text-zinc-500 mt-1">Manage partner charities, toggle feature status, and view metrics.</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 cursor-pointer">
           <Plus size={18} /> Add Charity
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Charity Name</th>
                <th className="px-6 py-4 font-semibold">Total Raised</th>
                <th className="px-6 py-4 font-semibold text-center">Featured</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr><td colSpan="4" className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
              ) : charities.map(c => (
                <tr key={c._id} className={`hover:bg-zinc-50 transition ${!c.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900">{c.name}</div>
                    <div className="text-zinc-500 text-xs truncate max-w-[200px]">{c.website}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${c.totalReceived?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleFeatured(c._id)} className={`p-2 rounded-full transition cursor-pointer ${c.isFeatured ? 'text-violet-600 bg-violet-100' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                       <Star size={18} fill={c.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" className="px-2 cursor-pointer" onClick={() => openEdit(c)}><Edit size={16}/></Button>
                    <Button variant="ghost" size="sm" className="px-2 text-red-500 hover:bg-red-50 cursor-pointer" onClick={() => handleDelete(c._id)}><Trash2 size={16}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Charity' : 'Create New Charity'}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Charity Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Website URL" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <textarea 
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4 cursor-pointer">{isEditing ? 'Update Charity' : 'Save Charity'}</Button>
        </form>
      </Modal>
    </div>
  );
}
