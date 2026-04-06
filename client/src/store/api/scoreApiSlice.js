import { apiSlice } from './apiSlice';

export const scoreApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScores: builder.query({
      query: () => '/scores',
      providesTags: (result) => {
        const scoresList = Array.isArray(result) ? result : result?.scores || [];
        return [
          ...scoresList.map(({ _id }) => ({ type: 'Score', id: _id })),
          { type: 'Score', id: 'LIST' },
        ];
      },
    }),
    addScore: builder.mutation({
      query: (body) => ({
        url: '/scores',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Score', id: 'LIST' }],
    }),
    updateScore: builder.mutation({
      query: ({ scoreId, ...body }) => ({
        url: `/scores/${scoreId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { scoreId }) => [{ type: 'Score', id: scoreId }],
    }),
    deleteScore: builder.mutation({
      query: (scoreId) => ({
        url: `/scores/${scoreId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, scoreId) => [{ type: 'Score', id: scoreId }, { type: 'Score', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetScoresQuery,
  useAddScoreMutation,
  useUpdateScoreMutation,
  useDeleteScoreMutation,
} = scoreApiSlice;
