import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeStats = (payload) => payload?.data ?? payload ?? null;
const normalizeUsers = (payload) => payload?.users ?? payload?.data ?? payload;
const normalizeWinners = (payload) => payload?.winners ?? payload?.data ?? payload;

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/admin/dashboard');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  },
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '', status = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      if (status) params.append('subscriptionStatus', status);
      const res = await axiosClient.get(`/admin/users?${params.toString()}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  },
);

export const fetchWinnersList = createAsyncThunk(
  'admin/fetchWinners',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/admin/winners');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch winners');
    }
  },
);

export const verifyWinner = createAsyncThunk(
  'admin/verifyWinner',
  async ({ drawId, userId }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/admin/draws/${drawId}/winners/${userId}/verify`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Verification failed');
    }
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    usersTotal: 0,
    usersPage: 1,
    winners: [],
    loading: false,
    usersLoading: false,
    winnersLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = normalizeStats(action.payload);
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        const payload = action.payload ?? {};
        state.usersLoading = false;
        state.users = Array.isArray(normalizeUsers(payload)) ? normalizeUsers(payload) : [];
        state.usersTotal = payload?.total ?? 0;
        state.usersPage = payload?.page ?? 1;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWinnersList.pending, (state) => {
        state.winnersLoading = true;
        state.error = null;
      })
      .addCase(fetchWinnersList.fulfilled, (state, action) => {
        state.winnersLoading = false;
        state.winners = Array.isArray(normalizeWinners(action.payload)) ? normalizeWinners(action.payload) : [];
      })
      .addCase(fetchWinnersList.rejected, (state, action) => {
        state.winnersLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyWinner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyWinner.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Winner verified and marked as paid';
        state.winners = state.winners.map((winner) => (
          winner?.winnerId === action.meta.arg.userId || winner?.userId?._id === action.meta.arg.userId
            ? { ...winner, paymentStatus: action.payload?.paymentStatus ?? 'paid' }
            : winner
        ));
      })
      .addCase(verifyWinner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminMessages } = adminSlice.actions;

export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminUsersTotal = (state) => state.admin.usersTotal;
export const selectAdminWinners = (state) => state.admin.winners;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminUsersLoading = (state) => state.admin.usersLoading;
export const selectAdminWinnersLoading = (state) => state.admin.winnersLoading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminSuccess = (state) => state.admin.successMessage;

export default adminSlice.reducer;
