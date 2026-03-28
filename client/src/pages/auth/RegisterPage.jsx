import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../api/authApi';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const { register: reg, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...body } = data;
      const result = await register(body).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      toast.success('Account created! Welcome.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.data?.message || 'Registration failed');
    }
  };

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', placeholder: 'Your name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-zinc-400">Join the Golf Charity Platform</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  {f.label}
                </label>
                <input
                  {...reg(f.name)}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700
                    text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500
                    focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                {errors[f.name] && (
                  <p className="mt-1.5 text-sm text-red-400">{errors[f.name].message}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700
                disabled:text-zinc-500 text-white font-medium rounded-xl transition-colors
                min-h-[48px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
