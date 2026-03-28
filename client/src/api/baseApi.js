import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../store/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Wrap base query to handle 401 auto-logout
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(logout());
      window.location.href = '/login';
    }
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', result.error);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'User',
    'Scores',
    'Charity',
    'Charities',
    'Draw',
    'Draws',
    'Subscription',
    'AdminDashboard',
    'AdminUser',
    'AdminUsers',
    'AdminStats',
    'AdminWinners',
  ],
  endpoints: () => ({}),
});
