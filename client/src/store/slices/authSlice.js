import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const normalizeUser = (payload) => {
  if (!payload) {
    return null;
  }

  return payload.user ?? payload.data?.user ?? (payload._id ? payload : payload.data?._id ? payload.data : null);
};

const normalizeToken = (payload) => payload?.token ?? payload?.data?.token ?? normalizeUser(payload)?.token ?? null;

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/auth/register', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put('/auth/profile', profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Profile update failed');
    }
  },
);

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('golf_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem('golf_token');

const initialState = {
  user: getStoredUser(),
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('golf_token');
      localStorage.removeItem('golf_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload ?? null;
      localStorage.setItem('golf_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const user = normalizeUser(action.payload);
        const token = normalizeToken(action.payload);
        state.loading = false;
        state.user = user;
        state.token = token;
        state.isAuthenticated = Boolean(token);
        if (token) {
          localStorage.setItem('golf_token', token);
        }
        localStorage.setItem('golf_user', JSON.stringify(user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const user = normalizeUser(action.payload);
        const token = normalizeToken(action.payload);
        state.loading = false;
        state.user = user;
        state.token = token;
        state.isAuthenticated = Boolean(token);
        if (token) {
          localStorage.setItem('golf_token', token);
        }
        localStorage.setItem('golf_user', JSON.stringify(user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = normalizeUser(action.payload);
        state.loading = false;
        state.user = user;
        localStorage.setItem('golf_user', JSON.stringify(user));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        const updated = normalizeUser(action.payload);
        state.loading = false;
        state.user = updated ? { ...(state.user ?? {}), ...updated } : state.user;
        localStorage.setItem('golf_user', JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export default authSlice.reducer;
