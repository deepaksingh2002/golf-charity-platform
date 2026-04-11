import { apiSlice } from './apiSlice';
import { normalizeApiList } from './apiUtils';

export const drawApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentDraw: builder.query({
      query: () => '/draws/current',
      providesTags: (result) =>
        result
          ? [{ type: 'Draw', id: result._id }, { type: 'Draw', id: 'CURRENT' }]
          : [{ type: 'Draw', id: 'CURRENT' }],
    }),
    getDrawHistory: builder.query({
      query: (params) => ({
        url: '/draws',
        params,
      }),
      providesTags: (result) => {
        const draws = normalizeApiList(result, 'draws');
        return [...draws.map(({ _id }) => ({ type: 'Draw', id: _id })), { type: 'Draw', id: 'HISTORY' }];
      },
    }),
    createDraw: builder.mutation({
      query: (body) => ({
        url: '/draws',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Draw', id: 'CURRENT' }, { type: 'Draw', id: 'HISTORY' }],
    }),
    simulateDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/simulate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Draw', id }, { type: 'Draw', id: 'CURRENT' }],
    }),
    publishDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Draw', id },
        { type: 'Draw', id: 'CURRENT' },
        { type: 'Draw', id: 'HISTORY' },
      ],
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
  useGetCurrentDrawQuery,
  useGetDrawHistoryQuery, 
  useCreateDrawMutation, 
  useSimulateDrawMutation, 
  usePublishDrawMutation,
  useUploadProofMutation
} = drawApiSlice;

// Backward-compatible alias while migrating call sites to current-draw terminology.
export const useGetActiveDrawsQuery = useGetCurrentDrawQuery;
