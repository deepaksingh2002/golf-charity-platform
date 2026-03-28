import { baseApi } from './baseApi';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionStatus: builder.query({
      query: () => '/subscriptions/status',
      providesTags: ['Subscription'],
    }),
    subscribe: builder.mutation({
      query: (payload) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: typeof payload === 'string' ? { priceId: payload } : payload,
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
});

export const {
  useCancelSubscriptionMutation,
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
} = subscriptionApi;
