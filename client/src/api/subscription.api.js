import axiosClient from './axiosClient';

export const subscriptionApi = {
  subscribe: (priceId) => axiosClient.post('/subscriptions/subscribe', { priceId }),
  cancel: () => axiosClient.post('/subscriptions/cancel'),
  getStatus: () => axiosClient.get('/subscriptions/status'),
};
