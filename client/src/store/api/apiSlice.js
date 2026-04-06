import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://golf-charity-6fnp.onrender.com/api',
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
