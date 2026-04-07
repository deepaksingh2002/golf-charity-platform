import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'https://golf-charity-6fnp.onrender.com/api',
<<<<<<< HEAD
=======
  credentials: 'include',
>>>>>>> 2a6943941c42e85197127f71468cb09d69d026ac
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState());
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Score', 'Charity', 'Draw', 'Admin', 'Subscription'],
  endpoints: () => ({}),
});
