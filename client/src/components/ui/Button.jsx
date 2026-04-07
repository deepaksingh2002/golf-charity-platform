import React from 'react';
import { Spinner } from './Spinner';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled, ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-95';
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 border border-emerald-500/20',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
    outline: 'bg-white/5 border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300',
    ghost: 'hover:bg-emerald-500/10 text-emerald-600',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20'
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs tracking-wider',
    md: 'h-11 px-6 py-2 text-sm',
    lg: 'h-14 px-8 text-base uppercase tracking-widest'
  };

  return (
    <button 
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" className="text-current" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
