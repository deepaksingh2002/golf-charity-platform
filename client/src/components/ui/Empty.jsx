export const Empty = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <div className="rounded-full bg-zinc-100 p-3 text-zinc-500 mb-4"><Icon className="h-6 w-6" /></div>}
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
