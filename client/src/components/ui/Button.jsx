export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    ghost: 'hover:bg-zinc-100 text-zinc-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
