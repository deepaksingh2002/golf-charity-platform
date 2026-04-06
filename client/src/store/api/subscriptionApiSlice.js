import { apiSlice } from './apiSlice';

export const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (plan) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: { plan },
      }),
    }),
    getSubscriptionStatus: builder.query({
      query: () => '/subscriptions/status',
      providesTags: ['Subscription'],
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

export const { useCreateCheckoutSessionMutation, useGetSubscriptionStatusQuery, useCancelSubscriptionMutation } = subscriptionApiSlice;
