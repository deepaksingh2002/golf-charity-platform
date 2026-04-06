import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../../store/api/authApiSlice';
import {
  setCredentials,
  selectIsAuthenticated,
} from '../../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const [registerAccount, { isLoading }] = useRegisterMutation();

  // deps: [isAuthenticated, navigate] redirects newly created accounts into the dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const res = await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      toast.success('Account created! Welcome.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">Create account</h1>
          <p className="text-zinc-400">Join the Golf Charity Platform</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {errors.name ? <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p> : null}
            </div>

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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {errors.password ? <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Confirm password</label>
              <input
                type="password"
                placeholder="........"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watch('password') || "Passwords don't match",
                })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {errors.confirmPassword ? <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
