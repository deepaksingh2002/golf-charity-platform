import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useGetCharitiesQuery } from '../../services/apiSlice';

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const { data: charities = [], isFetching: isLoading } = useGetCharitiesQuery({
    search: debouncedSearch,
    page,
    limit: 9,
  });

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">Our Partners</h1>
        <p className="text-lg text-zinc-600 mb-12">Discover and support incredible organizations making a real impact.</p>

        <div className="relative max-w-md mb-12">
          <Input
            placeholder="Search charities..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No charities found matching your search.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {charities.map(charity => (
                <Card key={charity._id} className="overflow-hidden flex flex-col hover:border-brand-200 transition-colors">
                  <div className="h-48 bg-zinc-200 overflow-hidden relative">
                    {charity.isFeatured && (
                      <div className="absolute top-4 left-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">FEATURED</div>
                    )}
                    {charity.imageUrl ? (
                      <img src={charity.imageUrl} alt={charity.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{charity.name}</h3>
                    <p className="text-zinc-600 text-sm mb-6 line-clamp-3 flex-1">{charity.description}</p>
                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Raised</span>
                        <span className="text-lg font-bold text-emerald-600">${charity.totalReceived?.toLocaleString() || '0'}</span>
                      </div>
                      <Link to={`/charities/${charity._id}`} className="text-sm font-semibold text-zinc-900 hover:text-brand-600 transition">
                        View Details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {charities.length === 9 && (
              <div className="mt-12">
                <Pagination currentPage={page} totalPages={page + 1} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
