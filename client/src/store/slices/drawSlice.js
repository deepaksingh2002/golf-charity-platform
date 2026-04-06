import { createSlice } from '@reduxjs/toolkit';

const drawSlice = createSlice({
  name: 'draws',
  initialState: { activeDraws: [], history: [], loading: false, error: null },
  reducers: {
    setDraws(state, action) {
      state.activeDraws = action.payload;
    },
  },
});

export const { setDraws } = drawSlice.actions;

export const selectActiveDraws = (s) => s.draws.activeDraws;
export const selectDrawHistory = (s) => s.draws.history;
export const selectDrawLoading = (s) => s.draws.loading;

export default drawSlice.reducer;
