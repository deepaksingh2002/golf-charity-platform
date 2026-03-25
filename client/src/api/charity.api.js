import axiosClient from './axiosClient';

export const charityApi = {
  getCharities: (params) => axiosClient.get('/charities', { params }),
  getCharity: (id) => axiosClient.get(`/charities/${id}`)
};
