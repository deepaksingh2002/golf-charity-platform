import { create } from 'zustand';
import { subscriptionApi } from '../api/subscription.api';

export const useSubscriptionStore = create((set) => ({
  subscription: null,
  isLoading: false,
  fetchSubscription: async () => {
    set({ isLoading: true });
    try {
      const res = await subscriptionApi.getStatus();
      set({ subscription: res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch subscription:', error);
    }
  }
}));
