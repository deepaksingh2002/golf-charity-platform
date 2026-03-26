import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Search, Eye } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 20, search, subscriptionStatus: statusFilter })
      .then(res => {
        setUsers(res.data.users || res.data || []);
        if (res.data.pages) setTotalPages(res.data.pages);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const viewUser = async (id) => {
    try {
      const res = await adminApi.getUserDetail(id);
      setSelectedUser(res.data);
      setModalOpen(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const handleSubOverride = async (action) => {
    if(!window.confirm(`Force ${action} for ${selectedUser.name}?`)) return;
    try {
      await adminApi.manageSubscription(selectedUser._id, action);
      toast.success('Subscription updated successfully');
      viewUser(selectedUser._id);
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleScoreEdit = async (scoreId, newVal) => {
    try {
       await adminApi.editUserScore(selectedUser._id, scoreId, { value: Number(newVal) });
       toast.success('Score patched');
       viewUser(selectedUser._id);
    } catch (err) {
       toast.error('Failed to update score');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-zinc-500 mt-1">View tracking data, patch scores, or override subscriptions manually.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 border-b border-zinc-200">
          <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between bg-zinc-50/50">
            <div className="relative max-w-sm w-full">
              <Input 
                placeholder="Search name or email..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex gap-2 p-1 bg-zinc-200/50 rounded-lg">
              {['', 'active', 'inactive', 'cancelled'].map(f => (
                <button 
                  key={f}
                  onClick={() => { setStatusFilter(f); setPage(1); }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize ${statusFilter === f ? 'bg-white shadow-sm text-zinc-900 cursor-default' : 'text-zinc-600 hover:text-zinc-900 cursor-pointer'}`}
                >
                  {f || 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-y border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Scores Count</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-zinc-500">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-zinc-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900">{u.name}</div>
                      <div className="text-zinc-500 text-xs">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
                        {u.subscriptionStatus || 'none'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{u.scores?.length || 0} / 5</td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewUser(u._id)} className="h-8 px-2 cursor-pointer">
                        <Eye className="w-4 h-4 mr-1.5"/> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="User Details & Administration">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-2xl text-zinc-500">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">{selectedUser.name}</h3>
                <p className="text-zinc-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <div>
                <p className="text-xs text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Subscription</p>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedUser.subscriptionStatus === 'active' ? 'active' : 'inactive'}>{selectedUser.subscriptionStatus}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Select Charity</p>
                <p className="font-medium text-sm truncate">{selectedUser.selectedCharity?.name || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-200 pb-2">Rolling Scores (Current List)</p>
              {selectedUser.scores?.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedUser.scores.map(s => (
                    <div key={s._id} className="flex justify-between items-center bg-white border border-zinc-200 p-2 rounded-md">
                      <span className="text-xs text-zinc-500">{new Date(s.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-sm border-zinc-300 rounded p-1 font-bold text-zinc-900 bg-zinc-100 focus:ring-0 cursor-pointer"
                          defaultValue={s.value}
                          onChange={(e) => handleScoreEdit(s._id, e.target.value)}
                        >
                          {Array.from({length: 45}, (_, i) => i + 1).map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-zinc-500 italic">No scores on record.</p>}
            </div>

            <div className="border-t border-zinc-200 pt-4 flex gap-3">
              <Button size="sm" variant={selectedUser.subscriptionStatus === 'active' ? 'danger' : 'primary'} className="flex-1 cursor-pointer"
                onClick={() => handleSubOverride(selectedUser.subscriptionStatus === 'active' ? 'cancel' : 'activate')}
              >
                Force {selectedUser.subscriptionStatus === 'active' ? 'Cancel' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
