import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Standard Error State Component
 * User-friendly error UI with retry action. Never exposes internal stack traces.
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700 mb-3">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-red-950">{title}</h3>
      <p className="mt-1 text-xs text-red-800 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
