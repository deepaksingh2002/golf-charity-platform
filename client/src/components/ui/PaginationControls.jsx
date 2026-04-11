import React from 'react';
import { Button } from './Button';

export function PaginationControls({
  currentPage = 1,
  totalPages = 1,
  currentCount = 0,
  totalItems = 0,
  itemLabel = 'items',
  onPageChange,
  loading = false,
  showControls = true,
  className = '',
}) {
  const canGoPrevious = currentPage > 1 && typeof onPageChange === 'function';
  const canGoNext = currentPage < totalPages && typeof onPageChange === 'function';

  return (
    <div className={`flex flex-col gap-3 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p>
        Showing {currentCount} of {totalItems} {itemLabel}
      </p>

      {showControls ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={!canGoPrevious || loading}
          >
            Previous
          </Button>

          <span className="min-w-20 text-center font-semibold text-zinc-700">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={!canGoNext || loading}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}