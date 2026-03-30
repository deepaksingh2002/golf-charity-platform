import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeSubscription = (payload) => payload?.subscription ?? payload?.data?.subscription ?? payload ?? {};

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/subscriptions/status');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscription');
    }
  },
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async ({ plan }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/subscriptions/subscribe', { plan });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Subscription failed');
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/subscriptions/cancel');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Cancellation failed');
    }
  },
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    status: null,
    plan: null,
    renewDate: null,
    clientSecret: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearSubscriptionMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.clientSecret = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        const sub = normalizeSubscription(action.payload);
        state.loading = false;
        state.status = sub?.status ?? 'inactive';
        state.plan = sub?.subscriptionPlan ?? sub?.plan ?? null;
        state.renewDate = sub?.renewDate ?? null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        const payload = action.payload ?? {};
        state.loading = false;
        state.clientSecret = payload?.clientSecret ?? null;
        if (payload?.mocked) {
          state.status = 'active';
          state.plan = payload?.plan ?? state.plan;
          state.successMessage = 'Subscription activated!';
        } else {
          state.successMessage = payload?.clientSecret ? 'Payment form ready' : 'Subscription request submitted';
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        state.status = 'cancelled';
        state.successMessage = 'Subscription cancelled';
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionMessages } = subscriptionSlice.actions;

export const selectSubscriptionStatus = (state) => state.subscription.status;
export const selectSubscriptionPlan = (state) => state.subscription.plan;
export const selectSubscriptionRenewDate = (state) => state.subscription.renewDate;
export const selectSubscriptionLoading = (state) => state.subscription.loading;
export const selectSubscriptionError = (state) => state.subscription.error;
export const selectSubscriptionSuccess = (state) => state.subscription.successMessage;
export const selectClientSecret = (state) => state.subscription.clientSecret;

export default subscriptionSlice.reducer;
