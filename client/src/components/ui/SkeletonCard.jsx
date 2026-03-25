export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`p-6 border border-zinc-200 rounded-xl bg-white animate-pulse ${className}`}>
      <div className="h-4 bg-zinc-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-zinc-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-zinc-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
    </div>
  );
};
