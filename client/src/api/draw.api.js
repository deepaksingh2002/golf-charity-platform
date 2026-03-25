import axiosClient from './axiosClient';

export const drawApi = {
  getPublishedDraws: (page = 1) => axiosClient.get(`/draws?page=${page}`),
  getCurrentDraw: () => axiosClient.get('/draws/current'),
  uploadProof: (drawId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    return axiosClient.post(`/draws/${drawId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
