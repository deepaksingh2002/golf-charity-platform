import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage.getItem('golf_user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem('golf_user');
    return null;
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('golf_token');
};

const setStoredUser = (user) => {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem('golf_user', JSON.stringify(user));
  } else {
    window.localStorage.removeItem('golf_user');
  }
};

const setStoredToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem('golf_token', token);
  } else {
    window.localStorage.removeItem('golf_token');
  }
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: getStoredUser(),
      token: getStoredToken(),
      isAuthenticated: Boolean(getStoredToken()),
      isLoading: false,
      setUser: (user) => {
        setStoredUser(user);
        set(state => ({ user, isAuthenticated: Boolean(state.token) }));
      },
      login: (userData, token) => {
        setStoredToken(token);
        setStoredUser(userData);
        set({ user: userData, token, isAuthenticated: true });
      },
      logout: () => {
        setStoredToken(null);
        setStoredUser(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const user = state.user || getStoredUser();
        const token = state.token || getStoredToken();
        if (user && user !== state.user) {
          state.user = user;
        }
        if (token && token !== state.token) {
          state.token = token;
        }
        state.isAuthenticated = Boolean(token);
        setStoredUser(user);
        setStoredToken(token);
      }
    }
  )
);
