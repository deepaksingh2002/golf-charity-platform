import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectToken } from '../slices/authSlice';
import { unwrapApiResponse } from './apiUtils';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'https://golf-charity-6fnp.onrender.com/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState());
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    return result;
  }

  return {
    ...result,
    data: unwrapApiResponse(result.data),
  };
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Score', 'Charity', 'Draw', 'Admin', 'Subscription'],
  endpoints: () => ({}),
});
