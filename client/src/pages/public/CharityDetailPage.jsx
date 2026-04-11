import React, { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar, Globe } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useGetCharityByIdQuery } from '../../store/api/charityApiSlice';
import { getApiErrorMessage } from '../../store/api/apiUtils';

export default function CharityDetailPage() {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const { data: charity, isLoading: loading, error } = useGetCharityByIdQuery(id, {
    skip: !id,
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load charity details'));
    }
  }, [error]);

  if (loading && !charity) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!charity) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-500">Charity not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative flex h-[60vh] flex-col justify-end bg-zinc-900">
        <div className="absolute inset-0">
          <img src={charity?.imageUrl || 'https://images.unsplash.com/photo-1593113511475-680f4f9547d5?w=1600'} alt={charity?.name ?? 'Charity hero'} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16">
          {charity?.isFeatured ? <span className="mb-4 inline-block rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">FEATURED PARTNER</span> : null}
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">{charity?.name ?? 'Unknown charity'}</h1>
          <div className="flex items-center space-x-6 text-zinc-300">
            <span className="flex items-center"><Globe className="mr-2 h-4 w-4" /> {charity?.website ?? 'No website listed'}</span>
            <span className="font-semibold text-emerald-400">${(charity?.totalReceived ?? 0).toFixed(2)} Raised</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900">About the cause</h2>
          <div className="prose prose-lg mb-12 max-w-none text-zinc-600">
            <p>{charity?.description ?? 'No description available.'}</p>
          </div>

          {(charity?.upcomingEvents ?? []).length > 0 ? (
            <>
              <h2 className="mb-6 text-2xl font-bold text-zinc-900">Upcoming Events</h2>
              <div className="space-y-4">
                {(charity?.upcomingEvents ?? []).map((event) => (
                  <div key={`${event?.title ?? 'event'}-${event?.date ?? 'date'}`} className="flex items-start rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                    <Calendar className="mr-4 h-6 w-6 shrink-0 text-brand-600" />
                    <div>
                      <h3 className="mb-1 font-semibold text-zinc-900">{event?.title ?? 'Untitled event'}</h3>
                      <p className="mb-2 text-sm font-medium text-brand-600">
                        {event?.date ? new Date(event.date).toLocaleDateString('en-GB') : 'Date to be confirmed'}
                      </p>
                      <p className="text-zinc-600">{event?.description ?? 'No event description available.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-zinc-900">Support {charity?.name ?? 'this charity'}</h3>
            <p className="mb-6 text-sm text-zinc-600">By subscribing, you can direct a percentage of your monthly contribution straight to this charity.</p>
            {user ? (
              <Link to="/dashboard/charity"><Button className="w-full" size="lg">Choose as my charity</Button></Link>
            ) : (
              <Link to="/register"><Button className="w-full" size="lg">Log in to support</Button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
