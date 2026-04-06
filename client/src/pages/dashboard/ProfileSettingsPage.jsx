import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { selectUser, updateUser } from '../../store/slices/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../store/api/authApiSlice';
import { User, Mail, Heart, Percent, Lock, Save, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      charityPercentage: user?.charityPercentage,
    }
  });

  const { register: passRegister, handleSubmit: passSubmit, reset: passReset } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      const res = await updateProfile(data).unwrap();
      dispatch(updateUser(res));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      await changePassword(data).unwrap();
      toast.success('Password updated successfully!');
      passReset();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update password');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Account Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your account information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <Card className="p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={20} className="text-emerald-500" />
            General Information
          </h2>
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Full Name</label>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="Your Name"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Email Address</label>
              <Input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                Charity Percentage (%)
              </label>
              <Input
                 type="number"
                {...register('charityPercentage', { 
                  required: 'Percentage is required',
                  min: { value: 10, message: 'Minimum 10%' },
                  max: { value: 100, message: 'Maximum 100%' }
                })}
                placeholder="10"
              />
              <p className="text-xs text-zinc-400">Percentage of winnings you want to donate.</p>
              {errors.charityPercentage && <p className="text-xs text-red-500">{errors.charityPercentage.message}</p>}
            </div>
            <Button type="submit" loading={isUpdatingProfile} className="w-full">
              <Save size={18} className="mr-2" />
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock size={20} className="text-violet-500" />
            Security & Password
          </h2>
          <form onSubmit={passSubmit(onUpdatePassword)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Current Password</label>
              <Input
                type="password"
                {...passRegister('currentPassword', { required: 'Current password is required' })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">New Password</label>
              <Input
                type="password"
                {...passRegister('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" loading={isChangingPassword} className="w-full bg-zinc-900 border-zinc-900 hover:bg-zinc-800">
              <Lock size={18} className="mr-2" />
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="p-8 border-red-100 bg-red-50/30">
        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-4">
          <Trash2 size={20} className="text-red-500" />
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-zinc-900">Delete Account</p>
            <p className="text-sm text-zinc-600">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
          <Button variant="danger" className="shrink-0 bg-red-600 border-red-600 text-white hover:bg-red-700">
            Request Deletion
          </Button>
        </div>
      </Card>
    </div>
  );
}
