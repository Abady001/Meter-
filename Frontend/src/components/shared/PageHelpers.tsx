'use client';

import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePageStore } from '@/lib/router-store';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function BackButton({ fallback }: { fallback?: string }) {
  const t = useT();
  const { goBack, navigate } = usePageStore();
  return (
    <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={() => {
      if (fallback) navigate(fallback as any);
      else goBack();
    }}>
      <ArrowLeft className="h-4 w-4" />
      {t('common.back')}
    </Button>
  );
}

export function StatCard({ label, value, icon, color, onClick }: { label: string; value: string | number; icon?: React.ReactNode; color?: string; onClick?: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p>{message || t('common.noData')}</p>
    </div>
  );
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null || isNaN(Number(amount))) return 'EGP 0.00';
  return `EGP ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDateTime(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
