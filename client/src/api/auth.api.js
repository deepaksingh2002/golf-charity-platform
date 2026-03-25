import axiosClient from './axiosClient';

export const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  register: (data) => axiosClient.post('/auth/register', data),
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/profile', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};
