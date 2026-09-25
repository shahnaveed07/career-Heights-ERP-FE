import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * PageLoader: Full viewport or main-content level spinner.
 * Used during route transitions or initial authentication hydration.
 */
export const PageLoader = ({ message = 'Loading...' }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center"
  >
    <Loader2 className="h-9 w-9 animate-spin text-blue-900" aria-hidden="true" />
    <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p>
    <span className="sr-only">Loading content, please wait...</span>
  </div>
);

/**
 * SectionLoader: Container-level spinner.
 * Used inside cards, tabs, or panels while fetching modular data.
 */
export const SectionLoader = ({ message = 'Loading section data...' }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/60 p-8 text-center"
  >
    <Loader2 className="h-7 w-7 animate-spin text-blue-800" aria-hidden="true" />
    <p className="mt-2.5 text-xs font-semibold text-slate-600">{message}</p>
    <span className="sr-only">Loading section, please wait...</span>
  </div>
);

/**
 * ButtonLoader: Inline spinner inside buttons.
 * Keeps the page responsive and prevents full-UI freezes.
 */
export const ButtonLoader = ({ className = 'h-3.5 w-3.5 mr-1.5' }) => (
  <Loader2 className={`animate-spin shrink-0 ${className}`} aria-hidden="true" />
);

/**
 * TableSkeleton: Shimmer skeleton for table bodies.
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div role="status" aria-label="Loading table records..." className="animate-pulse">
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 rounded bg-slate-200 ${
                cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-36' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
    <span className="sr-only">Loading records...</span>
  </div>
);

/**
 * CardSkeleton: Shimmer skeleton for card grids.
 */
export const CardSkeleton = ({ count = 3 }) => (
  <div
    role="status"
    aria-label="Loading cards..."
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-6 w-12 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-20 rounded bg-slate-200" />
        <div className="h-3 w-40 rounded bg-slate-100" />
      </div>
    ))}
    <span className="sr-only">Loading cards...</span>
  </div>
);
