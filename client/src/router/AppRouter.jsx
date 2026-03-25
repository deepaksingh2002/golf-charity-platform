import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import HomePage from '../pages/public/HomePage';
import HowItWorksPage from '../pages/public/HowItWorksPage';
import CharitiesPage from '../pages/public/CharitiesPage';
import CharityDetailPage from '../pages/public/CharityDetailPage';

const Placeholder = ({ title }) => <div className="p-8 text-center text-xl font-bold">{title}</div>;

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
          <Route path="/login" element={<Placeholder title="Login" />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute><Placeholder title="Dashboard Home" /></ProtectedRoute>} />
        <Route path="/dashboard/scores" element={<ProtectedRoute><Placeholder title="My Scores" /></ProtectedRoute>} />
        <Route path="/dashboard/subscription" element={<ProtectedRoute><Placeholder title="My Subscription" /></ProtectedRoute>} />
        <Route path="/dashboard/draws" element={<ProtectedRoute><Placeholder title="Draw Results" /></ProtectedRoute>} />
        <Route path="/dashboard/charity" element={<ProtectedRoute><Placeholder title="My Supported Charity" /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Placeholder title="Admin Dashboard" /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><Placeholder title="Manage Users" /></ProtectedRoute>} />
        <Route path="/admin/draws" element={<ProtectedRoute requireAdmin={true}><Placeholder title="Manage Draws" /></ProtectedRoute>} />
        <Route path="/admin/charities" element={<ProtectedRoute requireAdmin={true}><Placeholder title="Manage Charities" /></ProtectedRoute>} />
        <Route path="/admin/winners" element={<ProtectedRoute requireAdmin={true}><Placeholder title="Verify Winners" /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
