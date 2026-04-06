import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin } from '../store/slices/authSlice';

export default function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  if (!isAuthenticated) return <Navigate to="/login"    replace />;
  if (!isAdmin)         return <Navigate to="/dashboard" replace />;
  return children;
}
