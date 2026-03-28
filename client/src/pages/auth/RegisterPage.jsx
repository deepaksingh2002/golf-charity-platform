import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegisterMutation, useUpdateProfileMutation } from '../../api/auth.api';
import { useGetCharitiesQuery } from '../../api/charity.api';
import { setCredentials } from '../../store/authSlice';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  charityId: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: charities = [] } = useGetCharitiesQuery({ limit: 100 });
  const [registerRequest] = useRegisterMutation();
  const [updateProfile] = useUpdateProfileMutation();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerRequest({ name: data.name, email: data.email, password: data.password }).unwrap();
      const { token, ...userData } = res;
      dispatch(setCredentials({ user: userData, token }));
      
      if (data.charityId) {
        await updateProfile({ selectedCharity: data.charityId }).unwrap();
      }
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create an Account</h1>
          <p className="text-zinc-500">Join the platform to support charities and win prizes.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Support a Charity (Optional)</label>
            <select 
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              {...register('charityId')}
            >
              <option value="">Select a charity...</option>
              {charities.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-zinc-600 text-sm">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
