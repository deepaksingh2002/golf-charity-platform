import { apiSlice } from './apiSlice';
import { normalizeApiList } from './apiUtils';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: (result) => {
        const users = normalizeApiList(result, 'users');
        return [...users.map(({ _id }) => ({ type: 'User', id: _id })), { type: 'User', id: 'LIST' }];
      },
    }),
    getUserDetail: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    editUserScore: builder.mutation({
      query: ({ userId, scoreId, ...body }) => ({
        url: `/admin/users/${userId}/scores/${scoreId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { userId, scoreId }) => [
        { type: 'User', id: userId },
        { type: 'Score', id: scoreId },
      ],
    }),
    manageUserSubscription: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/admin/users/${userId}/subscription`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    getWinnersList: builder.query({
      query: () => '/admin/winners',
      providesTags: ['Admin'],
    }),
    verifyWinner: builder.mutation({
      query: ({ drawId, winnerId }) => ({
        url: `/admin/draws/${drawId}/winners/${winnerId}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: ['Admin'],
    }),
    uploadAdminDrawProof: builder.mutation({
      query: ({ drawId, body }) => ({
        url: `/admin/draws/${drawId}/proof`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Admin', 'Draw'],
    }),
    getCharityReport: builder.query({
      query: () => '/admin/charity-report',
      providesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAdminDashboardStatsQuery,
  useGetAllUsersQuery,
  useGetUserDetailQuery,
  useEditUserScoreMutation,
  useManageUserSubscriptionMutation,
  useGetWinnersListQuery,
  useVerifyWinnerMutation,
  useUploadAdminDrawProofMutation,
  useGetCharityReportQuery,
} = adminApiSlice;
