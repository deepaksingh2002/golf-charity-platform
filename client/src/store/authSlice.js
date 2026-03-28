import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('golf_token');
const user = (() => {
  try { return JSON.parse(localStorage.getItem('golf_user') || 'null'); }
  catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user || null,
    isAuthenticated: !!token,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('golf_token', token);
      localStorage.setItem('golf_user', JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('golf_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('golf_token');
      localStorage.removeItem('golf_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
