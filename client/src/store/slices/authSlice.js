import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('golf_user') || 'null'); }
  catch { return null; }
};

const normalizeUserPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  // Unwrap nested data structures
  if (payload.data && typeof payload.data === 'object') {
    const normalizedData = normalizeUserPayload(payload.data);
    const rest = { ...payload };
    delete rest.data;
    return {
      ...(normalizedData || {}),
      ...rest,
    };
  }

  if (payload.user && typeof payload.user === 'object') {
    const { user, ...rest } = payload;
    return {
      ...(user || {}),
      ...rest,
    };
  }

  if (payload.profile && typeof payload.profile === 'object') {
    const { profile, ...rest } = payload;
    return {
      ...(profile || {}),
      ...rest,
    };
  }

  // Ensure role always exists (default to 'user')
  const normalized = { ...payload };
  if (!normalized.role) {
    normalized.role = 'user';
  }

  return normalized;
};

export const hasAdminAccess = (user) => {
  const normalizedUser = normalizeUserPayload(user);
  if (!normalizedUser) return false;

  // Check explicit boolean flags
  if (normalizedUser.isAdmin === true) return true;
  if (normalizedUser.is_admin === true) return true;

  // Check role field - case-insensitive, trim whitespace, normalize hyphens/spaces to underscores
  const role = typeof normalizedUser.role === 'string'
    ? normalizedUser.role.toLowerCase().trim().replace(/[-\s]/g, '_')
    : '';
  
  if (role === 'admin' || role === 'superadmin' || role === 'super_admin') {
    return true;
  }

  // Check roles array (fallback)
  if (Array.isArray(normalizedUser.roles)) {
    return normalizedUser.roles.some((entry) => {
      const normalized = typeof entry === 'string' ? entry.toLowerCase().trim() : '';
      return normalized === 'admin' || normalized === 'superadmin' || normalized === 'super_admin';
    });
  }

  return false;
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
      state.user = normalizeUserPayload(user);
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('golf_token', token);
      localStorage.setItem('golf_user', JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('golf_token');
      localStorage.removeItem('golf_user');
    },
    updateUser(state, action) {
      const normalizedPayload = normalizeUserPayload(action.payload);
      state.user = { ...(state.user || {}), ...(normalizedPayload || {}) };
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
export const selectIsAdmin         = (s) => hasAdminAccess(s.auth.user);

export default authSlice.reducer;
