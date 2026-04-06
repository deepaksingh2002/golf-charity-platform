import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { currentPlan: null, loading: false, error: null },
  reducers: {
    setPlan(state, action) {
      state.currentPlan = action.payload;
    },
  },
});

export const { setPlan } = subscriptionSlice.actions;

export const selectCurrentPlan = (s) => s.subscription.currentPlan;
export const selectSubLoading  = (s) => s.subscription.loading;

export default subscriptionSlice.reducer;
