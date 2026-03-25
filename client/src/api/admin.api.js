import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  getUserDetail: (id) => axiosClient.get(`/admin/users/${id}`),
  editUserScore: (userId, scoreId, data) => axiosClient.put(`/admin/users/${userId}/scores/${scoreId}`, data),
  manageSubscription: (userId, action) => axiosClient.put(`/admin/users/${userId}/subscription`, { action }),
  getWinners: (params) => axiosClient.get('/admin/winners', { params }),
  verifyWinner: (drawId, winnerId) => axiosClient.put(`/admin/draws/${drawId}/winners/${winnerId}/verify`),
  getCharityReport: () => axiosClient.get('/admin/charity-report'),
  
  createCharity: (data) => axiosClient.post('/charities', data),
  updateCharity: (id, data) => axiosClient.put(`/charities/${id}`, data),
  deleteCharity: (id) => axiosClient.delete(`/charities/${id}`),
  toggleFeaturedCharity: (id) => axiosClient.patch(`/charities/${id}/featured`),
  addCharityEvent: (id, event) => axiosClient.post(`/charities/${id}/events`, event),

  createDraw: (data) => axiosClient.post('/draws', data),
  simulateDraw: (id) => axiosClient.post(`/draws/${id}/simulate`),
  publishDraw: (id) => axiosClient.post(`/draws/${id}/publish`)
};
