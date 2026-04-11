import { apiSlice } from './apiSlice';

export const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribe: builder.mutation({
      query: (payload) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: typeof payload === 'string' ? { plan: payload } : payload,
      }),
      invalidatesTags: ['Subscription', 'User'],
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

export const {
  useSubscribeMutation,
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
} = subscriptionApiSlice;

// Backward-compatible alias while migrating call sites.
export const useCreateCheckoutSessionMutation = useSubscribeMutation;
