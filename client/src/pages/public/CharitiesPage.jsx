import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { useGetCharitiesQuery } from '../../store/api/charityApiSlice';

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const { data: charitiesResponse, isLoading: loading, error } = useGetCharitiesQuery(search, {
    // Adding a debounce effect on typing is ideal, but RTK handles caching effectively
  });
  const charities = Array.isArray(charitiesResponse) ? charitiesResponse : charitiesResponse?.charities || [];

  useEffect(() => {
    if (error) {
      console.error('Charities fetch error:', error);
      const errorMsg = error?.data?.message || error?.message || 'Failed to load charities. Please try again.';
      toast.error(errorMsg);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 md:text-5xl">Our Partners</h1>
        <p className="mb-12 text-lg text-zinc-600">Discover and support incredible organizations making a real impact.</p>

        <div className="relative mb-12 max-w-md">
          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (charities ?? []).length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(charities ?? []).map((charity) => (
              <Card key={charity?._id ?? charity?.name} className="flex flex-col overflow-hidden transition-colors hover:border-brand-200">
                <div className="relative h-48 overflow-hidden bg-zinc-200">
                  {charity?.isFeatured ? (
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">FEATURED</div>
                  ) : null}
                  {charity?.imageUrl ? (
                    <img src={charity.imageUrl} alt={charity?.name ?? 'Charity image'} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">No Image</div>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 text-xl font-bold text-zinc-900">{charity?.name ?? 'Unknown charity'}</h3>
                  <p className="mb-6 flex-1 line-clamp-3 text-sm text-zinc-600">{charity?.description ?? 'No description available'}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Raised</span>
                      <span className="text-lg font-bold text-emerald-600">${(charity?.totalReceived ?? 0).toFixed(2)}</span>
                    </div>
                    <Link to={`/charities/${charity?._id ?? ''}`} className="text-sm font-semibold text-zinc-900 transition hover:text-brand-600">
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-zinc-500">No charities found matching your search.</div>
        )}
      </div>
    </div>
  );
}
