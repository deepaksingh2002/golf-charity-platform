import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useAuthStore } from '../store/authStore';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('golf_token');
};

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers) => {
    const token = useAuthStore.getState().token || getStoredToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Charities', 'Charity', 'Scores', 'Draw', 'Subscription'],
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getCharities: builder.query({
      query: (params) => ({
        url: '/charities',
        params,
      }),
      providesTags: ['Charities'],
    }),
    getCharity: builder.query({
      query: (id) => `/charities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Charity', id }],
    }),
    getScores: builder.query({
      query: () => '/scores',
      providesTags: ['Scores', 'User'],
    }),
    addScore: builder.mutation({
      query: (body) => ({
        url: '/scores',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Scores', 'User', 'Draw'],
    }),
    deleteScore: builder.mutation({
      query: (id) => ({
        url: `/scores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scores', 'User', 'Draw'],
    }),
    getCurrentDraw: builder.query({
      query: () => '/draws/current',
      providesTags: ['Draw'],
    }),
    getPublishedDraws: builder.query({
      query: (page = 1) => `/draws?page=${page}`,
      providesTags: ['Draw'],
    }),
    getSubscriptionStatus: builder.query({
      query: () => '/subscriptions/status',
      providesTags: ['Subscription'],
    }),
    subscribe: builder.mutation({
      query: (payload) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: typeof payload === 'string' ? { priceId: payload } : payload,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),
    cancelSubscription: builder.mutation({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),
  }),
});

export const {
  useAddScoreMutation,
  useCancelSubscriptionMutation,
  useDeleteScoreMutation,
  useGetCharitiesQuery,
  useGetCharityQuery,
  useGetCurrentDrawQuery,
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetPublishedDrawsQuery,
  useGetScoresQuery,
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
  useUpdateProfileMutation,
} = apiSlice;
