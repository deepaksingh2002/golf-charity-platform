import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getDashboardStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    getAllUsers: builder.query({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),

    getUserDetail: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminUsers', id }],
    }),

    editUserScore: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/admin/users/${userId}/scores`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    getWinnersList: builder.query({
      query: (params = {}) => ({
        url: '/admin/winners',
        params,
      }),
      providesTags: ['AdminWinners'],
    }),

    verifyWinner: builder.mutation({
      query: ({ drawId, userId }) => ({
        url: `/admin/winners/${drawId}/${userId}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminWinners', 'AdminStats'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetAllUsersQuery,
  useGetUserDetailQuery,
  useEditUserScoreMutation,
  useGetWinnersListQuery,
  useVerifyWinnerMutation,
} = adminApi;
