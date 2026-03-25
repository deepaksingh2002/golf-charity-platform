import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Public Pages
import HomePage from '../pages/public/HomePage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import CharitiesPage from '../pages/public/CharitiesPage';
import CharityDetailPage from '../pages/public/CharityDetailPage';

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

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Outlet />
  </div>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/charities/:id" element={<CharityDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="scores" element={<ScoresPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="draws" element={<DrawPage />} />
          <Route path="charity" element={<CharityPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="draws" element={<AdminDrawsPage />} />
          <Route path="charities" element={<AdminCharitiesPage />} />
          <Route path="winners" element={<AdminWinnersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
