import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['AdminDashboard'],
    }),
    getAdminUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),
    getAdminUserDetail: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminUser', id }],
    }),
    editAdminUserScore: builder.mutation({
      query: ({ userId, scoreId, value }) => ({
        url: `/admin/users/${userId}/scores/${scoreId}`,
        method: 'PUT',
        body: { value },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'AdminUsers',
        'AdminDashboard',
        'Scores',
        'User',
        { type: 'AdminUser', id: userId },
      ],
    }),
    manageAdminSubscription: builder.mutation({
      query: ({ userId, action }) => ({
        url: `/admin/users/${userId}/subscription`,
        method: 'PUT',
        body: { action },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'AdminUsers',
        'AdminDashboard',
        'Subscription',
        'User',
        { type: 'AdminUser', id: userId },
      ],
    }),
    getAdminWinners: builder.query({
      query: (params) => ({
        url: '/admin/winners',
        params,
      }),
      providesTags: ['AdminWinners'],
    }),
    verifyWinner: builder.mutation({
      query: ({ drawId, winnerId }) => ({
        url: `/admin/draws/${drawId}/winners/${winnerId}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: ['AdminWinners', 'AdminDashboard', 'Draw'],
    }),
    createCharity: builder.mutation({
      query: (body) => ({
        url: '/charities',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Charities', 'Charity', 'AdminDashboard'],
    }),
    updateCharity: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/charities/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ['Charities', { type: 'Charity', id }],
    }),
    deleteCharity: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charities', 'AdminDashboard'],
    }),
    toggleFeaturedCharity: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => ['Charities', { type: 'Charity', id }],
    }),
    createDraw: builder.mutation({
      query: (body) => ({
        url: '/draws',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Draw', 'AdminDashboard'],
    }),
    simulateDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/simulate`,
        method: 'POST',
      }),
      invalidatesTags: ['Draw'],
    }),
    publishDraw: builder.mutation({
      query: (id) => ({
        url: `/draws/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Draw', 'AdminDashboard', 'AdminWinners'],
    }),
  }),
});

export const {
  useCreateCharityMutation,
  useCreateDrawMutation,
  useDeleteCharityMutation,
  useEditAdminUserScoreMutation,
  useGetAdminDashboardStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminWinnersQuery,
  useLazyGetAdminUserDetailQuery,
  useManageAdminSubscriptionMutation,
  usePublishDrawMutation,
  useSimulateDrawMutation,
  useToggleFeaturedCharityMutation,
  useUpdateCharityMutation,
  useVerifyWinnerMutation,
} = adminApi;
