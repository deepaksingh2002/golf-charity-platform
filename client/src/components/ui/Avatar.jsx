export const Avatar = ({ src, alt, fallback, size = 'md', className = '' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' };
  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full bg-zinc-100 place-items-center justify-center ${sizes[size]} ${className}`}>
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
      ) : (
        <span className="font-medium text-zinc-600 uppercase">{fallback?.substring(0, 2) || 'XX'}</span>
      )}
    </div>
  );
};
