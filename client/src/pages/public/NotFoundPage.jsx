import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-3">404</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4">Page not found</h1>
        <p className="text-zinc-500 mb-8">
          The page you’re looking for doesn’t exist, or it may have been moved. Let’s get you back on course.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
          <Button onClick={() => navigate('/')} className="bg-emerald-600 hover:bg-emerald-700">Go Home</Button>
        </div>
      </div>
    </div>
  );
}
