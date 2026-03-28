import { baseApi } from './baseApi';

export const scoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getScores: builder.query({
      query: () => '/scores',
      providesTags: ['Scores'],
    }),

    addScore: builder.mutation({
      query: (data) => ({
        url: '/scores',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Scores'],
    }),

    updateScore: builder.mutation({
      query: ({ scoreId, ...data }) => ({
        url: `/scores/${scoreId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Scores'],
    }),

    deleteScore: builder.mutation({
      query: (scoreId) => ({
        url: `/scores/${scoreId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scores'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetScoresQuery,
  useAddScoreMutation,
  useUpdateScoreMutation,
  useDeleteScoreMutation,
} = scoreApi;
