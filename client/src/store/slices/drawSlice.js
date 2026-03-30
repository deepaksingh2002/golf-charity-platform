import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeDraws = (payload) => {
  const draws = payload?.draws ?? payload?.data ?? payload;
  return Array.isArray(draws) ? draws : [];
};

const normalizeDraw = (payload) => payload?.draw ?? payload?.data?.draw ?? payload ?? null;

export const fetchPublishedDraws = createAsyncThunk(
  'draws/fetchPublished',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/draws');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch draws');
    }
  },
);

export const fetchCurrentDraw = createAsyncThunk(
  'draws/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/draws/current');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch current draw');
    }
  },
);

export const createDraw = createAsyncThunk(
  'draws/create',
  async (drawData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/draws', drawData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create draw');
    }
  },
);

export const simulateDraw = createAsyncThunk(
  'draws/simulate',
  async (drawId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(`/draws/${drawId}/simulate`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Simulation failed');
    }
  },
);

export const publishDraw = createAsyncThunk(
  'draws/publish',
  async (drawId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(`/draws/${drawId}/publish`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Publish failed');
    }
  },
);

export const uploadWinnerProof = createAsyncThunk(
  'draws/uploadProof',
  async ({ drawId, formData }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(`/draws/${drawId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  },
);

const drawSlice = createSlice({
  name: 'draws',
  initialState: {
    publishedDraws: [],
    currentDraw: null,
    activeDraft: null,
    loading: false,
    simulateLoading: false,
    publishLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearDrawMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedDraws.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedDraws.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedDraws = normalizeDraws(action.payload);
      })
      .addCase(fetchPublishedDraws.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentDraw.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentDraw.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraw = normalizeDraw(action.payload);
        state.activeDraft = normalizeDraw(action.payload);
      })
      .addCase(fetchCurrentDraw.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDraw.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDraw.fulfilled, (state, action) => {
        state.loading = false;
        state.activeDraft = normalizeDraw(action.payload);
        state.currentDraw = normalizeDraw(action.payload);
        state.successMessage = 'Draw created successfully';
      })
      .addCase(createDraw.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(simulateDraw.pending, (state) => {
        state.simulateLoading = true;
        state.error = null;
      })
      .addCase(simulateDraw.fulfilled, (state, action) => {
        state.simulateLoading = false;
        state.activeDraft = normalizeDraw(action.payload);
        state.currentDraw = normalizeDraw(action.payload);
        state.successMessage = 'Simulation complete';
      })
      .addCase(simulateDraw.rejected, (state, action) => {
        state.simulateLoading = false;
        state.error = action.payload;
      })
      .addCase(publishDraw.pending, (state) => {
        state.publishLoading = true;
        state.error = null;
      })
      .addCase(publishDraw.fulfilled, (state, action) => {
        const published = normalizeDraw(action.payload);
        state.publishLoading = false;
        state.publishedDraws = published ? [published, ...state.publishedDraws] : state.publishedDraws;
        state.activeDraft = null;
        state.currentDraw = null;
        state.successMessage = 'Draw published successfully';
      })
      .addCase(publishDraw.rejected, (state, action) => {
        state.publishLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadWinnerProof.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadWinnerProof.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Proof uploaded successfully';
      })
      .addCase(uploadWinnerProof.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDrawMessages } = drawSlice.actions;

export const selectPublishedDraws = (state) => state.draws.publishedDraws;
export const selectCurrentDraw = (state) => state.draws.currentDraw;
export const selectActiveDraft = (state) => state.draws.activeDraft;
export const selectDrawsLoading = (state) => state.draws.loading;
export const selectSimulateLoading = (state) => state.draws.simulateLoading;
export const selectPublishLoading = (state) => state.draws.publishLoading;
export const selectDrawsError = (state) => state.draws.error;
export const selectDrawsSuccess = (state) => state.draws.successMessage;

export default drawSlice.reducer;
