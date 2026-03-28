import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Spinner } from '../components/ui/Spinner';
import { useGetMeQuery } from '../api/auth.api';
import { logout, selectCurrentToken, selectCurrentUser, updateUser } from '../store/authSlice';
import { AdminRoute } from './AdminRoute';

// Public Pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const HowItWorksPage = lazy(() => import('../pages/public/HowItWorksPage'));
const CharitiesPage = lazy(() => import('../pages/public/CharitiesPage'));
const CharityDetailPage = lazy(() => import('../pages/public/CharityDetailPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Standard Dashboard
const DashboardLayout = lazy(() => import('../pages/dashboard/DashboardLayout'));
const DashboardOverviewPage = lazy(() => import('../pages/dashboard/DashboardOverviewPage'));
const ScoresPage = lazy(() => import('../pages/dashboard/ScoresPage'));
const DrawPage = lazy(() => import('../pages/dashboard/DrawPage'));
const SubscriptionPage = lazy(() => import('../pages/dashboard/SubscriptionPage'));
const CharityPage = lazy(() => import('../pages/dashboard/CharityPage'));

// Admin Dashboard
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminDrawsPage = lazy(() => import('../pages/admin/AdminDrawsPage'));
const AdminCharitiesPage = lazy(() => import('../pages/admin/AdminCharitiesPage'));
const AdminWinnersPage = lazy(() => import('../pages/admin/AdminWinnersPage'));

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
     <Outlet />
  </div>
);

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const { data, error, isFetching } = useGetMeQuery(undefined, {
    skip: !token,
  });
  const requiresBlockingAuth =
    Boolean(token) &&
    !user &&
    (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) &&
    isFetching;

  useEffect(() => {
    if (data) {
      dispatch(updateUser(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (token && error) {
      dispatch(logout());
    }
  }, [dispatch, token, error]);

  if (requiresBlockingAuth) {
    return <div className="flex justify-center p-12"><Spinner /></div>;
  }

  return children;
};

export const AppRouter = () => {
  return (
    <ErrorBoundary>
      <AuthBootstrap>
        <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/charities" element={<PageTransition><CharitiesPage /></PageTransition>} />
              <Route path="/charities/:id" element={<PageTransition><CharityDetailPage /></PageTransition>} />
              <Route path="/how-it-works" element={<PageTransition><HowItWorksPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            </Route>

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<PageTransition><DashboardOverviewPage /></PageTransition>} />
              <Route path="scores" element={<PageTransition><ScoresPage /></PageTransition>} />
              <Route path="subscription" element={<PageTransition><SubscriptionPage /></PageTransition>} />
              <Route path="draws" element={<PageTransition><DrawPage /></PageTransition>} />
              <Route path="charity" element={<PageTransition><CharityPage /></PageTransition>} />
            </Route>

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<PageTransition><AdminDashboardPage /></PageTransition>} />
              <Route path="users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
              <Route path="draws" element={<PageTransition><AdminDrawsPage /></PageTransition>} />
              <Route path="charities" element={<PageTransition><AdminCharitiesPage /></PageTransition>} />
              <Route path="winners" element={<PageTransition><AdminWinnersPage /></PageTransition>} />
            </Route>

            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </Suspense>
      </AuthBootstrap>
    </ErrorBoundary>
  );
};
