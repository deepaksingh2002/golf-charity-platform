import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGetCharityQuery } from '../../services/apiSlice';

export default function CharityDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: charity, isFetching: isLoading } = useGetCharityQuery(id, {
    skip: !id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!charity) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Charity not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[60vh] bg-zinc-900 flex flex-col justify-end">
        <div className="absolute inset-0">
          <img src={charity.imageUrl || 'https://images.unsplash.com/photo-1593113511475-680f4f9547d5?w=1600'} alt={charity.name} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pb-16 w-full">
          {charity.isFeatured && <span className="inline-block bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">FEATURED PARTNER</span>}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{charity.name}</h1>
          <div className="flex items-center space-x-6 text-zinc-300">
            <span className="flex items-center"><Globe className="w-4 h-4 mr-2"/> {charity.website || 'No website listed'}</span>
            <span className="font-semibold text-emerald-400">${charity.totalReceived?.toLocaleString()} Raised</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">About the cause</h2>
          <div className="prose prose-lg text-zinc-600 max-w-none mb-12">
            <p>{charity.description}</p>
          </div>

          {charity.galleryImages && charity.galleryImages.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
                {charity.galleryImages.map((img, i) => (
                  <img key={i} src={img} alt="Gallery" loading="lazy" className="w-full h-32 object-cover rounded-xl" />
                ))}
              </div>
            </>
          )}

          {charity.upcomingEvents && charity.upcomingEvents.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {charity.upcomingEvents.map((evt, i) => (
                  <div key={i} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50 flex items-start">
                    <Calendar className="w-6 h-6 text-brand-600 mr-4 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-1">{evt.title}</h3>
                      <p className="text-sm text-brand-600 font-medium mb-2">{new Date(evt.date).toLocaleDateString()}</p>
                      <p className="text-zinc-600">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-zinc-50 border border-zinc-200 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Support {charity.name}</h3>
            <p className="text-zinc-600 text-sm mb-6">By subscribing, you can direct a percentage of your monthly contribution straight to this charity.</p>
            {user ? (
              <Button className="w-full" size="lg">Choose as my charity</Button>
            ) : (
              <Link to="/register"><Button className="w-full" size="lg">Log in to support</Button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
