import { createSlice } from '@reduxjs/toolkit';

const scoreSlice = createSlice({
  name: 'scores',
  initialState: { scores: [], loading: false, error: null, success: null },
  reducers: {
    clearScoreState(state) { state.error = null; state.success = null; },
  },
});

export const { clearScoreState } = scoreSlice.actions;

export const selectScores        = (s) => s.scores.scores;
export const selectScoresLoading = (s) => s.scores.loading;
export const selectScoresError   = (s) => s.scores.error;
export const selectScoresSuccess = (s) => s.scores.success;

export default scoreSlice.reducer;
