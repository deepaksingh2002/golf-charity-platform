import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeCharities = (payload) => {
  const charities = payload?.charities ?? payload?.data ?? payload;
  return Array.isArray(charities) ? charities : [];
};

const normalizeCharity = (payload) => payload?.charity ?? payload?.data?.charity ?? payload?.data ?? payload ?? null;

export const fetchCharities = createAsyncThunk(
  'charities/fetchAll',
  async ({ searchQuery = '', page, limit } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const suffix = params.toString() ? `?${params}` : '';
      const res = await axiosClient.get(`/charities${suffix}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch charities');
    }
  },
);

export const fetchCharityById = createAsyncThunk(
  'charities/fetchById',
  async (charityId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/charities/${charityId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch charity');
    }
  },
);

export const selectUserCharity = createAsyncThunk(
  'charities/selectForUser',
  async ({ charityId, percentage }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put('/auth/profile', {
        selectedCharity: charityId || null,
        charityPercentage: percentage,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to select charity');
    }
  },
);

export const createCharity = createAsyncThunk(
  'charities/create',
  async (charityData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/charities', charityData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create charity');
    }
  },
);

export const updateCharity = createAsyncThunk(
  'charities/update',
  async ({ charityId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/charities/${charityId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update charity');
    }
  },
);

export const deleteCharity = createAsyncThunk(
  'charities/delete',
  async (charityId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/charities/${charityId}`);
      return charityId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete charity');
    }
  },
);

export const toggleFeatured = createAsyncThunk(
  'charities/toggleFeatured',
  async (charityId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(`/charities/${charityId}/featured`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle featured');
    }
  },
);

const charitySlice = createSlice({
  name: 'charities',
  initialState: {
    list: [],
    selectedCharity: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCharityMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharities.fulfilled, (state, action) => {
        state.loading = false;
        state.list = normalizeCharities(action.payload);
      })
      .addCase(fetchCharities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCharityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCharity = normalizeCharity(action.payload);
      })
      .addCase(fetchCharityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(selectUserCharity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(selectUserCharity.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Charity updated successfully';
        state.selectedCharity = normalizeCharity(action.payload);
      })
      .addCase(selectUserCharity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCharity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCharity.fulfilled, (state, action) => {
        state.loading = false;
        state.list = [...state.list, normalizeCharity(action.payload)].filter(Boolean);
        state.successMessage = 'Charity created';
      })
      .addCase(createCharity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCharity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCharity.fulfilled, (state, action) => {
        const updated = normalizeCharity(action.payload);
        state.loading = false;
        state.list = state.list.map((charity) => (charity?._id === updated?._id ? updated : charity));
        state.successMessage = 'Charity updated';
      })
      .addCase(updateCharity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCharity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharity.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((charity) => charity?._id !== action.payload);
        state.successMessage = 'Charity deleted';
      })
      .addCase(deleteCharity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        const updated = normalizeCharity(action.payload);
        state.loading = false;
        state.list = state.list.map((charity) => (charity?._id === updated?._id ? updated : charity));
        state.successMessage = 'Featured status updated';
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCharityMessages } = charitySlice.actions;

export const selectCharities = (state) => state.charities.list;
export const selectSelectedCharity = (state) => state.charities.selectedCharity;
export const selectCharitiesLoading = (state) => state.charities.loading;
export const selectCharitiesError = (state) => state.charities.error;
export const selectCharitiesSuccess = (state) => state.charities.successMessage;

export default charitySlice.reducer;
