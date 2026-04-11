import { apiSlice } from './apiSlice';

export const systemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health',
    }),
  }),
});

export const { useGetHealthQuery } = systemApiSlice;
