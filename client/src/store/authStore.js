import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      login: (userData, token) => set({ user: userData, token }),
      logout: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
