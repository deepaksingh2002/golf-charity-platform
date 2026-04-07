import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../../store/api/authApiSlice';
import {
  setCredentials,
  selectIsAuthenticated,
  selectIsAdmin,
} from '../../store/slices/authSlice';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Trophy } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const redirectPath = location.state?.from?.pathname;
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath || (isAdmin ? '/admin' : '/dashboard'), { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectPath]);

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      const token = res.token;
      const user = res.user ? res.user : { _id: res._id, name: res.name, email: res.email, role: res.role };
      
      dispatch(setCredentials({ user, token }));
      toast.success('Welcome back!');
      navigate(redirectPath || (user?.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white mb-6 shadow-2xl shadow-emerald-500/20 rotate-3">
             <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium tracking-wide">Enter your credentials to access the platform</p>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 rounded-2xl"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 rounded-2xl"
            />

            <div className="pt-2">
              <Button
                type="submit"
                loading={isLoading}
                className="w-full py-4 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/10"
              >
                Sign In to Account
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center">
             <p className="text-sm text-zinc-500 font-medium">
               New to the platform?{' '}
               <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors">
                 Create member account
               </Link>
             </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          Golf Charity Platform © 2026 • Secure Infrastructure
        </p>
      </div>
    </div>
  );
}
