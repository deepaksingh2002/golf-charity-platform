import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password is required')
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success('Welcome back!');
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Back</h1>
          <p className="text-zinc-500">Sign in to manage your scores and subscriptions.</p>
        </div>

        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700">
              <ShieldCheck size={16} />
            </div>
            <div className="text-sm text-emerald-950">
              <p className="font-semibold">Admin access</p>
              <p className="mt-1 text-emerald-800">Admin users sign in here with their admin email and will be sent straight to the admin panel.</p>
              <p className="mt-2 font-medium">Demo admin: admin@golfcharity.com</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            {...register('email')} 
            error={errors.email?.message} 
          />
          <Input 
            label="Password" 
            type="password" 
            {...register('password')} 
            error={errors.password?.message} 
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-zinc-600 text-sm">
          Don't have an account? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Register here</Link>
        </p>
        <p className="text-center mt-2 text-zinc-500 text-sm">
          Already an admin? After signing in, open <span className="font-medium text-zinc-700">/admin</span> any time.
        </p>
      </div>
    </div>
  );
}
