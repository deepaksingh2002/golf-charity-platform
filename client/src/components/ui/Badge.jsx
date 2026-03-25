export const Badge = ({ children, variant = 'active', className = '' }) => {
  const variants = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-zinc-100 text-zinc-800',
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-violet-100 text-violet-800'
  };
  return (
    <div className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold overflow-hidden transition-colors ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
