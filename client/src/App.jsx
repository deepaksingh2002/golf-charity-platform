import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from './store/api/authApiSlice';
import { logout, selectToken, selectUser, updateUser } from './store/slices/authSlice';
import { Spinner } from './components/ui/Spinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const isUnauthorizedError = (error) => {
  const status = error?.status;
  return status === 401 || status === 403;
};

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Keep auth state synchronized with backend identity whenever a token exists.
  const { data: userData, error, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (userData) {
      dispatch(updateUser(userData));
    }
    // Logout only for authentication/authorization failures.
    if (error && isUnauthorizedError(error)) {
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
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-zinc-200 bg-white/90 px-6 py-4 text-center text-sm text-zinc-500">
          Copyright © @deepaksingh2002
        </footer>
      </div>
    </ErrorBoundary>
  );
}
