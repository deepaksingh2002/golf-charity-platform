import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Placeholder = ({ title }) => <div className="p-8 text-center text-xl font-bold">{title}</div>;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/charities" element={<Placeholder title="Charities" />} />
        <Route path="/charities/:id" element={<Placeholder title="Charity Detail" />} />
        <Route path="/how-it-works" element={<Placeholder title="How It Works" />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/register" element={<Placeholder title="Register" />} />

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
