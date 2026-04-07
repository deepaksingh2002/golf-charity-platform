import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from './store/api/authApiSlice';
import { logout, selectToken, selectUser, updateUser } from './store/slices/authSlice';
import { Spinner } from './components/ui/Spinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Hydrate auth state once from /auth/me when a persisted token exists.
  const { data: userData, error, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !token || !!user, // Skip if no token or user already exists
  });

  useEffect(() => {
    if (userData) {
      dispatch(updateUser(userData));
    }
    // On 401 or explicit error, logout
    if (error) {
      console.warn('Auth hydration failed:', error);
      dispatch(logout());
    }
  }, [userData, error, dispatch]);

  // Optionally block rendering for protected routes if hydrating
  const isHydrating = Boolean(token) && !user && (isLoading || isFetching) && 
    (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin'));

  if (isHydrating) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Outlet />
      </div>
    </ErrorBoundary>
  );
}
