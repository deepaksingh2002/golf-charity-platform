import { baseApi } from './baseApi';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getSubscriptionStatus: builder.query({
      query: () => '/subscriptions/status',
      providesTags: ['Subscription'],
    }),

    subscribe: builder.mutation({
      query: (data) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),

    cancelSubscription: builder.mutation({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
