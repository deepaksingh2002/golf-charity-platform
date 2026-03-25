import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 lg:m-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
          <p className="text-zinc-600 mb-6 max-w-sm mx-auto">We encountered an unexpected error while loading this view.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition shadow-sm font-medium cursor-pointer">
            Reset View
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}
