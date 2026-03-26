import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Public Pages
import HomePage from '../pages/public/HomePage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import CharitiesPage from '../pages/public/CharitiesPage';
import CharityDetailPage from '../pages/public/CharityDetailPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Standard Dashboard
import DashboardLayout from '../pages/dashboard/DashboardLayout';
import DashboardOverviewPage from '../pages/dashboard/DashboardOverviewPage';
import ScoresPage from '../pages/dashboard/ScoresPage';
import DrawPage from '../pages/dashboard/DrawPage';
import SubscriptionPage from '../pages/dashboard/SubscriptionPage';
import CharityPage from '../pages/dashboard/CharityPage';

// Admin Dashboard
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminDrawsPage from '../pages/admin/AdminDrawsPage';
import AdminCharitiesPage from '../pages/admin/AdminCharitiesPage';
import AdminWinnersPage from '../pages/admin/AdminWinnersPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token } = useAuthStore();
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

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
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

          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<PageTransition><AdminDashboardPage /></PageTransition>} />
            <Route path="users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
            <Route path="draws" element={<PageTransition><AdminDrawsPage /></PageTransition>} />
            <Route path="charities" element={<PageTransition><AdminCharitiesPage /></PageTransition>} />
            <Route path="winners" element={<PageTransition><AdminWinnersPage /></PageTransition>} />
          </Route>

          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
