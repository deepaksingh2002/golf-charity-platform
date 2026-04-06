import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: { stats: null, users: [], winners: [], loading: false, error: null },
  reducers: {
    clearAdminState(state) {
      state.stats = null;
      state.users = [];
    }
  },
});

export const { clearAdminState } = adminSlice.actions;

export const selectAdminStats   = (s) => s.admin.stats;
export const selectAdminUsers   = (s) => s.admin.users;
export const selectAdminWinners = (s) => s.admin.winners;
export const selectAdminLoading = (s) => s.admin.loading;

export default adminSlice.reducer;
