import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: { ...userData },
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: { ...userData },
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: { ...passwordData },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApiSlice;
