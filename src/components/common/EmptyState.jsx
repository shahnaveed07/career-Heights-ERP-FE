import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Standard Empty State Component
 * Displayed when lists, tables, or search filters yield no results.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display matching the current criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 sm:p-12 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
