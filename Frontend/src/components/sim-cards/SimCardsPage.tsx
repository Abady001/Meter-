'use client';

import { useSimCardsList } from '@/hooks/use-sim-cards';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { formatDate } from '@/components/shared/PageHelpers';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

function SimEligibilityBadge({ status, assignmentEndDate }: { status: string; assignmentEndDate?: string }) {
  const isEligible = status === 'available' || status === 'reusable';
  const isAssigned = status === 'active' || status === 'assigned';

  if (isEligible && status === 'available') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Eligible
            </Badge>
          </TooltipTrigger>
          <TooltipContent>SIM is available for assignment</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isEligible && status === 'reusable') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 gap-1">
              <Clock className="h-3 w-3" /> Cooldown
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {assignmentEndDate
              ? `Cooldown until ${formatDate(assignmentEndDate)}`
              : 'SIM is in cooldown period after previous assignment'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isAssigned || status === 'suspended') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 gap-1">
              <XCircle className="h-3 w-3" /> Ineligible
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {status === 'active' ? 'SIM is currently assigned to an active meter' :
             status === 'assigned' ? 'SIM is currently assigned to a meter' :
             'SIM is suspended and cannot be assigned'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}

export default function SimCardsPage() {
  const t = useT();
  const simCardsQuery = useSimCardsList();
  const simCards = simCardsQuery.data ?? [];
  const providers = [...new Set(simCards.map((s) => s.provider))];

  const columns = [
    {
      key: 'iccid', label: t('simCards.iccid'), sortable: true,
      render: (v: string) => <span className="font-mono text-xs">{v.slice(0, 12)}...{v.slice(-4)}</span>,
    },
    { key: 'msisdn', label: t('simCards.phoneNumber'), sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: true, render: (v: string) => v || '-' },
    {
      key: 'ipType', label: 'IP Type', width: '90px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'provider', label: t('simCards.provider'), sortable: true },
    {
      key: 'assignedMeterSerial', label: 'Assigned Meter',
      render: (v: string) => v ? <span className="font-mono text-xs">{v}</span> : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'eligibility', label: 'Eligibility', width: '120px',
      render: (_v: unknown, row: { status: string; assignmentEndDate?: string }) => (
        <SimEligibilityBadge status={row.status} assignmentEndDate={row.assignmentEndDate} />
      ),
    },
    {
      key: 'status', label: t('simCards.status'), sortable: true, width: '110px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'assignmentStartDate', label: 'Assignment Start', width: '130px',
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <div>
      <PageHeader title={t('simCards.title')} subtitle={t('simCards.subtitle')} />
      <QueryBoundary query={simCardsQuery}>
      <SmartTable
        data={simCards}
        columns={columns}
        filters={[
          {
            key: 'provider', label: 'Provider', type: 'select',
            options: providers.map((p) => ({ label: p, value: p })),
          },
          {
            key: 'status', label: 'Status', type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Available', value: 'available' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Reusable', value: 'reusable' },
              { label: 'Retired', value: 'retired' },
            ],
          },
          {
            key: 'assigned', label: 'Assignment', type: 'select',
            options: [
              { label: 'Assigned', value: 'assigned' },
              { label: 'Unassigned', value: 'unassigned' },
            ],
          },
        ]}
        searchable
        searchPlaceholder={t('simCards.search')}
      />
      </QueryBoundary>
    </div>
  );
}

