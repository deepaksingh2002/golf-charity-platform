import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, HeartPulse } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useGetCharitiesQuery } from '../../store/api/charityApiSlice';

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: charitiesResponse,
    isLoading: loading,
    isFetching,
    error,
  } = useGetCharitiesQuery(debouncedSearch);
  const charities = Array.isArray(charitiesResponse) ? charitiesResponse : charitiesResponse?.charities || [];

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-32 animate-in fade-in duration-700">
      <div className="mx-auto max-w-7xl px-6 text-center sm:text-left">
        <h1 className="mb-4 text-4xl font-extrabold text-zinc-900 md:text-6xl tracking-tight">Our Partners</h1>
        <p className="mb-12 text-lg text-zinc-500 max-w-2xl font-medium">Discover and support incredible organizations making a global impact through golf and charity.</p>

        <div className="relative mb-16 max-w-md mx-auto sm:mx-0">
          <Input
            placeholder="Search by mission or name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-12 py-6 rounded-2xl border-zinc-200 shadow-xl shadow-zinc-500/5 focus:ring-4 focus:ring-emerald-500/10"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        </div>

        {isFetching && !loading ? (
          <p className="mb-6 text-sm text-zinc-500">Searching partners...</p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : error ? (
          <EmptyState 
            icon={HeartPulse}
            title="Failed to load partners"
            description="We're having trouble connecting to our charity database right now."
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : charities.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity) => (
              <Card key={charity?._id ?? charity?.name} className="flex flex-col group overflow-hidden border-zinc-100 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-3xl">
                <div className="relative h-56 overflow-hidden bg-zinc-200">
                  {charity?.isFeatured && (
                    <div className="absolute left-4 top-4 z-10 rounded-xl bg-violet-600 px-4 py-1.5 text-[10px] font-black text-white shadow-lg shadow-violet-500/20">FEATURED</div>
                  )}
                  {charity?.imageUrl ? (
                    <img src={charity.imageUrl} alt={charity?.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400 font-bold bg-zinc-100">NO IMAGE</div>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-8 bg-white">
                  <h3 className="mb-3 text-2xl font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{charity?.name}</h3>
                  <p className="mb-8 flex-1 line-clamp-3 text-sm text-zinc-500 leading-relaxed font-medium">{charity?.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-zinc-50 pt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Impact Generated</span>
                      <span className="text-xl font-black text-emerald-600">£{(charity?.totalReceived ?? 0).toLocaleString()}</span>
                    </div>
                    <Link to={`/charities/${charity?._id}`} className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Search}
            title="No partners found"
            description={`We couldn't find any charities matching "${search}".`}
            actionLabel="View All Partners"
            onAction={() => setSearch('')}
            className="py-32"
          />
        )}
      </div>
    </div>
  );
}
