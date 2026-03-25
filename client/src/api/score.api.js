import axiosClient from './axiosClient';

export const scoreApi = {
  getScores: () => axiosClient.get('/scores'),
  addScore: (data) => axiosClient.post('/scores', data),
  updateScore: (id, data) => axiosClient.put(`/scores/${id}`, data),
  deleteScore: (id) => axiosClient.delete(`/scores/${id}`),
};
