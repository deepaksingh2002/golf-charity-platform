import axiosClient from './axiosClient';

export const subscriptionApi = {
  subscribe: (payload) => {
    if (typeof payload === 'string') {
      return axiosClient.post('/subscriptions/subscribe', { priceId: payload });
    }
    return axiosClient.post('/subscriptions/subscribe', payload);
  },
  cancel: () => axiosClient.post('/subscriptions/cancel'),
  getStatus: () => axiosClient.get('/subscriptions/status'),
};
