import { baseApi } from './baseApi';

export const drawApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPublishedDraws: builder.query({
      query: () => '/draws',
      providesTags: ['Draws'],
    }),

    getCurrentDraw: builder.query({
      query: () => '/draws/current',
      providesTags: ['Draws'],
    }),

    createDraw: builder.mutation({
      query: (data) => ({
        url: '/draws',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Draws'],
    }),

    simulateDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/simulate`,
        method: 'POST',
      }),
      invalidatesTags: ['Draws'],
    }),

    publishDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Draws', 'AdminStats'],
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
  overrideExisting: false,
});

export const {
  useGetPublishedDrawsQuery,
  useGetCurrentDrawQuery,
  useCreateDrawMutation,
  useSimulateDrawMutation,
  usePublishDrawMutation,
  useUploadWinnerProofMutation,
} = drawApi;
