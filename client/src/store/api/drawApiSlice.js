import { apiSlice } from './apiSlice';

export const drawApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveDraws: builder.query({
      query: () => '/draws/current',
      providesTags: (result) =>
        result
          ? [{ type: 'Draw', id: result._id }, { type: 'Draw', id: 'CURRENT' }]
          : [{ type: 'Draw', id: 'CURRENT' }],
    }),
    getDrawHistory: builder.query({
      query: () => '/draws',
      providesTags: (result) =>
        Array.isArray(result)
          ? [...result.map(({ _id }) => ({ type: 'Draw', id: _id })), { type: 'Draw', id: 'HISTORY' }]
          : [{ type: 'Draw', id: 'HISTORY' }],
    }),
    createDraw: builder.mutation({
      query: (body) => ({
        url: '/draws',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Draw', id: 'LIST' }, { type: 'Draw', id: 'HISTORY' }],
    }),
    simulateDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/simulate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Draw', id: 'LIST' }],
    }),
    publishDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Draw', id: 'LIST' }, { type: 'Draw', id: 'HISTORY' }],
    }),
    uploadProof: builder.mutation({
      query: ({ id, body }) => ({
        url: `/draws/${id}/proof`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Draw', id }],
    }),
  }),
});

export const { 
  useGetActiveDrawsQuery, 
  useGetDrawHistoryQuery, 
  useCreateDrawMutation, 
  useSimulateDrawMutation, 
  usePublishDrawMutation,
  useUploadProofMutation
} = drawApiSlice;
