import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('golf_user') || 'null'); }
  catch { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            getStoredUser(),
    token:           localStorage.getItem('golf_token') || null,
    isAuthenticated: !!localStorage.getItem('golf_token'),
    loading:         false,
    error:           null,
  },
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('golf_token', token);
      localStorage.setItem('golf_user', JSON.stringify(user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('golf_token');
      localStorage.removeItem('golf_user');
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('golf_user', JSON.stringify(state.user));
    },
    clearError(state) {
      state.error = null;
    }
  },
});

export const { setCredentials, logout, updateUser, clearError } = authSlice.actions;

export const selectUser            = (s) => s.auth.user;
export const selectToken           = (s) => s.auth.token;
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectAuthLoading     = (s) => s.auth.loading;
export const selectAuthError       = (s) => s.auth.error;
export const selectIsAdmin         = (s) => s.auth.user?.role === 'admin';

export default authSlice.reducer;
