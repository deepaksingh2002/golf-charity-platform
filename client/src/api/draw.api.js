import { baseApi } from './baseApi';

export const drawApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentDraw: builder.query({
      query: () => '/draws/current',
      providesTags: ['Draw'],
    }),
    getPublishedDraws: builder.query({
      query: (page = 1) => `/draws?page=${page}`,
      providesTags: ['Draw'],
    }),
  }),
});

export const {
  useGetCurrentDrawQuery,
  useGetPublishedDrawsQuery,
} = drawApi;
