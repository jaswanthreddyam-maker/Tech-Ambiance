import React from 'react';
import { Loader2, AlertCircle, FileQuestion } from 'lucide-react';

// =============================================================================
// PORTAL DATA STATE
// Generic wrapper for all portal widgets. Handles loading, error, and empty states.
// Fully customizable via slots so each widget can have premium UX.
// =============================================================================

interface PortalDataStateProps {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  children: React.ReactNode;
  
  // Customization
  loadingSlot?: React.ReactNode;
  errorSlot?: React.ReactNode;
  emptySlot?: React.ReactNode;
  
  // Quick fallback if no custom empty slot is provided
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
}

export const PortalDataState: React.FC<PortalDataStateProps> = ({
  isLoading,
  error,
  isEmpty,
  children,
  loadingSlot,
  errorSlot,
  emptySlot,
  emptyMessage = 'No data available.',
  emptyIcon: EmptyIcon = FileQuestion,
}) => {
  if (isLoading) {
    if (loadingSlot) return <>{loadingSlot}</>;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#0B3027]/50 animate-pulse">
        <Loader2 className="w-8 h-8 mb-4 animate-spin" />
        <p className="font-mono text-sm uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (error) {
    if (errorSlot) return <>{errorSlot}</>;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-500/80 bg-red-50/50 rounded-2xl border border-red-100">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="font-mono text-sm uppercase tracking-wider text-center">
          Failed to load data<br/>
          <span className="text-xs opacity-70 normal-case mt-2 block">
            {(error as Error)?.message || 'An unexpected error occurred'}
          </span>
        </p>
      </div>
    );
  }

  if (isEmpty) {
    if (emptySlot) return <>{emptySlot}</>;
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#0B3027]/40 bg-black/5 rounded-2xl border border-dashed border-[#0B3027]/10">
        <EmptyIcon className="w-10 h-10 mb-4 opacity-50" />
        <p className="font-mono text-sm tracking-wide text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
