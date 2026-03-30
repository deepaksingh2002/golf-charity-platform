import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
  selectIsAdmin,
} from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const redirectPath = location.state?.from?.pathname;
  const { register, handleSubmit, formState: { errors } } = useForm();

  // deps: [error, dispatch] surfaces auth failures once and then clears them from Redux state.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // deps: [isAuthenticated, isAdmin, navigate, redirectPath] redirects successful sessions away from the login page.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath || (isAdmin ? '/admin' : '/dashboard'), { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectPath]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      const user = result.payload?.user ?? result.payload;
      toast.success('Welcome back!');
      navigate(redirectPath || (user?.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-zinc-400">Sign in to your account</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {errors.email ? <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                placeholder="........"
                {...register('password', { required: 'Password is required' })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {errors.password ? <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            No account?{' '}
            <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
