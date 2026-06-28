'use client';

import type { ReactNode } from 'react';
import { isApiError } from '@/lib/api';
import { EmptyState } from '@/components/shared/PageHelpers';

interface QueryBoundaryProps {
  children: ReactNode;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

const defaultLoading = (
  <div className="flex items-center justify-center py-16 text-muted-foreground">
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm">Loading...</p>
    </div>
  </div>
);

function defaultErrorFallback(error: unknown) {
  const correlationId = isApiError(error) ? error.correlationId : undefined;
  const message = isApiError(error) ? error.message : 'An unexpected error occurred';
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm text-red-500">{message}</p>
      {correlationId && (
        <p className="text-xs mt-1">Correlation ID: {correlationId}</p>
      )}
    </div>
  );
}

export function QueryBoundary({
  children,
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage,
  loadingFallback = defaultLoading,
  errorFallback,
}: QueryBoundaryProps) {
  if (isLoading) return loadingFallback;
  if (isError) return errorFallback ?? defaultErrorFallback(error);
  if (isEmpty) return <EmptyState message={emptyMessage} />;
  return <>{children}</>;
}
