import { createSlice } from '@reduxjs/toolkit';

const charitySlice = createSlice({
  name: 'charities',
  initialState: { charities: [], selectedCharity: null, loading: false, error: null },
  reducers: {
    setSelectedCharity(state, action) {
      state.selectedCharity = action.payload;
    },
  },
});

export const { setSelectedCharity } = charitySlice.actions;

export const selectAllCharities    = (s) => s.charities.charities;
export const selectSelectedCharity = (s) => s.charities.selectedCharity;
export const selectCharityLoading  = (s) => s.charities.loading;

export default charitySlice.reducer;
