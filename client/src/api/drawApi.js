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
    uploadWinnerProof: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/draws/${id}/proof`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['AdminWinners'],
    }),
  }),
});

export const {
  useGetCurrentDrawQuery,
  useGetPublishedDrawsQuery,
  useUploadWinnerProofMutation,
} = drawApi;
