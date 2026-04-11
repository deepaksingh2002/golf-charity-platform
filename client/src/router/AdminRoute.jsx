import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from '../components/ui/Spinner';
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectToken,
  selectUser,
} from '../store/slices/authSlice';

export default function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  // Avoid redirecting to dashboard before /auth/me hydrates user roles.
  if (token && !user) {
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login"    replace />;
  if (!isAdmin)         return <Navigate to="/dashboard" replace />;
  return children;
}
