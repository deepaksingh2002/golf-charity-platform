import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('golf_token');
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token || getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      toast.error('Could not connect to server. Please try again.');
    } else if (error.response.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
