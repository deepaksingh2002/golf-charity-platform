import { baseApi } from './baseApi';

export const scoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useAddScoreMutation,
  useDeleteScoreMutation,
  useGetScoresQuery,
} = scoreApi;
