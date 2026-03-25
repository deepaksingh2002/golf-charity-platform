import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white disabled:opacity-50 hover:bg-zinc-100 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium text-zinc-700">
        Page {currentPage} of {Math.max(1, totalPages)}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white disabled:opacity-50 hover:bg-zinc-100 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
