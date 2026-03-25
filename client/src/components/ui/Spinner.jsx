import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return <Loader2 className={`animate-spin text-brand-500 ${sizes[size]} ${className}`} />;
};
