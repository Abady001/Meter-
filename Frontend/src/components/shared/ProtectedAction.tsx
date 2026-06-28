'use client';

import type { ReactNode } from 'react';
import { useAuthStore } from '@/lib/mock-auth';
import { canPerform, type BillingAction } from '@/lib/action-permissions';

interface ProtectedActionProps {
  action: BillingAction;
  fallback?: ReactNode;
  children: ReactNode;
}

export function ProtectedAction({ action, fallback = null, children }: ProtectedActionProps) {
  const user = useAuthStore((s) => s.user);
  if (canPerform(user?.role, action)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
