'use client';

import { useNotifications, useMarkRead, useUnreadCount } from '@/hooks/use-notifications';
import { PageHeader, StatCard, formatDateTime } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function AlertsPage() {
  const t = useT();
  const { data: notifData } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkRead();
  const notifications = notifData?.items ?? [];
  const mapped = notifications.map((n: any) => ({ id: n.id, title: n.title, type: n.type, severity: n.type === 'critical' ? 'critical' : 'medium', description: n.body ?? '', entityLabel: n.referenceId ?? '', createdAt: n.createdAt, acknowledged: n.isRead }));

  const total = mapped.length;
  const critical = mapped.filter((a: any) => a.severity === 'critical' && !a.acknowledged).length;
  const high = mapped.filter((a: any) => a.severity === 'high' && !a.acknowledged).length;
  const medium = mapped.filter((a: any) => a.severity !== 'critical' && a.severity !== 'high' && !a.acknowledged).length;
  const low = 0;

  const handleAcknowledge = (id: string) => {
    markRead.mutate(id, { onSuccess: () => {} });
  };

  const columns = [
    { key: 'title', label: t('alerts.message'), sortable: true },
    {
      key: 'type', label: 'Type', width: '140px',
      render: (v: string) => <span className="text-xs font-mono">{v.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'severity', label: t('alerts.severity'), sortable: true, width: '100px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'description', label: 'Description', render: (v: string) => <span className="text-xs text-muted-foreground line-clamp-1">{v}</span> },
    { key: 'entityLabel', label: 'Entity', width: '150px', render: (v: string) => <span className="text-xs">{v}</span> },
    { key: 'createdAt', label: t('alerts.date'), sortable: true, width: '130px', render: (v: string) => formatDateTime(v) },
    {
      key: 'acknowledged', label: t('alerts.status'), width: '60px',
      render: (v: boolean, row: { id: string }) => v ? (
        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
      ) : (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleAcknowledge(row.id); }}>
          {t('alerts.acknowledge')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('alerts.title')} subtitle={t('alerts.subtitle')} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label={t('common.all')} value={total} icon={<Bell className="h-5 w-5" />} />
        <StatCard label={t('alerts.critical')} value={critical} icon={<AlertCircle className="h-5 w-5" />} color="text-red-500" />
        <StatCard label={t('alerts.high')} value={high} icon={<AlertTriangle className="h-5 w-5" />} color="text-orange-500" />
        <StatCard label={t('alerts.medium')} value={medium} color="text-amber-500" />
        <StatCard label={t('alerts.low')} value={low} icon={<Info className="h-5 w-5" />} color="text-blue-500" />
      </div>

      <SmartTable
        data={mapped as any}
        columns={columns}
        filters={[
          {
            key: 'severity', label: t('alerts.severity'),
            options: [
              { label: t('alerts.critical'), value: 'critical' },
              { label: t('alerts.high'), value: 'high' },
              { label: t('alerts.medium'), value: 'medium' },
              { label: t('alerts.low'), value: 'low' },
            ],
          },
          {
            key: 'acknowledged', label: t('alerts.status'),
            options: [
              { label: t('common.no'), value: 'false' },
              { label: t('common.yes'), value: 'true' },
            ],
          },
          {
            key: 'type', label: t('alerts.source'),
            options: [
              { label: 'Offline Meter', value: 'offline_meter' },
              { label: 'High Consumption', value: 'high_consumption' },
              { label: 'Zero Consumption', value: 'zero_consumption' },
              { label: 'Water Difference', value: 'water_difference' },
              { label: 'Overdue Invoice', value: 'overdue_invoice' },
              { label: 'Communication Failure', value: 'communication_failure' },
              { label: 'SIM/IP Issue', value: 'sim_ip_issue' },
              { label: 'Missing Reading', value: 'missing_reading' },
            ],
          },
        ]}
        searchable
        searchPlaceholder={t('alerts.search')}
      />
    </div>
  );
}
