import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeScores = (payload) => {
  const scores = payload?.scores ?? payload?.data ?? payload;
  return Array.isArray(scores) ? scores : [];
};

export const fetchScores = createAsyncThunk(
  'scores/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/scores');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch scores');
    }
  },
);

export const addScore = createAsyncThunk(
  'scores/add',
  async (scoreData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/scores', scoreData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add score');
    }
  },
);

export const updateScore = createAsyncThunk(
  'scores/update',
  async ({ scoreId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/scores/${scoreId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update score');
    }
  },
);

export const deleteScore = createAsyncThunk(
  'scores/delete',
  async (scoreId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.delete(`/scores/${scoreId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete score');
    }
  },
);

const scoreSlice = createSlice({
  name: 'scores',
  initialState: {
    scores: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearScoreMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchScores.pending, handlePending)
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = normalizeScores(action.payload);
      })
      .addCase(fetchScores.rejected, handleRejected)
      .addCase(addScore.pending, handlePending)
      .addCase(addScore.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = normalizeScores(action.payload);
        state.successMessage = 'Score added successfully';
      })
      .addCase(addScore.rejected, handleRejected)
      .addCase(updateScore.pending, handlePending)
      .addCase(updateScore.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = normalizeScores(action.payload);
        state.successMessage = 'Score updated successfully';
      })
      .addCase(updateScore.rejected, handleRejected)
      .addCase(deleteScore.pending, handlePending)
      .addCase(deleteScore.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = normalizeScores(action.payload);
        state.successMessage = 'Score deleted successfully';
      })
      .addCase(deleteScore.rejected, handleRejected);
  },
});

export const { clearScoreMessages } = scoreSlice.actions;

export const selectScores = (state) => state.scores.scores;
export const selectScoresLoading = (state) => state.scores.loading;
export const selectScoresError = (state) => state.scores.error;
export const selectScoresSuccess = (state) => state.scores.successMessage;

export default scoreSlice.reducer;
