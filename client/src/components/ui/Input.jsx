import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`flex w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-bold text-red-500 ml-1 flex items-center gap-1 animate-in slide-in-from-left-2 duration-300">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs font-medium text-zinc-400 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
