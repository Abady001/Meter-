'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Gauge,
  WifiOff,
  Activity,
  Bell,
  Receipt,
  TrendingUp,
  Scale,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Droplets,
  AlertTriangle,
  FileText,
  CreditCard,
  TicketCheck,
  AlertCircle,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/context';
import { useDashboardKpis, useConsumptionTrend, useRecentActivity } from '@/hooks/use-dashboard';
import { useMetersList } from '@/hooks/use-meters';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

// ---- Icon Map ----

const iconMap: Record<string, React.ElementType> = {
  Users,
  Gauge,
  WifiOff,
  Activity,
  Bell,
  Receipt,
  TrendingUp,
  Scale,
};

// ---- Meter Status Data ----

function getMeterStatusData(metersList: any[]) {
  const counts: Record<string, number> = {};
  metersList.forEach((m: any) => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const PIE_COLORS: Record<string, string> = {
  active: '#A3FF12',
  available: '#60A5FA',
  offline: '#F87171',
  faulty: '#FB923C',
  assigned: '#38BDF8',
  replaced: '#FBBF24',
  terminated: '#94A3B8',
  retired: '#64748B',
};

// ---- Alert severity counts ----

function getAlertSummary() {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  const unacknowledged: any[] = [];
  unacknowledged.forEach((a) => {
    counts[a.severity] = (counts[a.severity] || 0) + 1;
  });
  return counts;
}

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: ShieldCheck },
  high: { label: 'High', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: AlertCircle },
  medium: { label: 'Medium', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: AlertTriangle },
  low: { label: 'Low', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30', icon: Bell },
};

// ---- Activity type icons ----

const activityIconMap: Record<string, React.ElementType> = {
  reading: Activity,
  invoice: FileText,
  payment: CreditCard,
  ticket: TicketCheck,
  alert: AlertTriangle,
  assignment: GitBranch,
};

const activityColorMap: Record<string, string> = {
  reading: 'text-primary bg-primary/10',
  invoice: 'text-sky-400 bg-sky-400/10',
  payment: 'text-emerald-400 bg-emerald-400/10',
  ticket: 'text-orange-400 bg-orange-400/10',
  alert: 'text-red-400 bg-red-400/10',
  assignment: 'text-violet-400 bg-violet-400/10',
};

// ---- Custom Tooltip ----

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatter?: (val: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 border border-border/40 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Animate number hook ----

function useAnimatedValue(target: string | number, duration = 1200) {
  const [display, setDisplay] = useState(() => {
    const numericStr = String(target).replace(/[^0-9.]/g, '');
    const numericTarget = parseFloat(numericStr);
    if (isNaN(numericTarget)) return String(target);
    const prefix = String(target).match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = String(target).match(/[^0-9.]*$/)?.[0] ?? '';
    return `${prefix}0${suffix}`;
  });

  useEffect(() => {
    const numericStr = String(target).replace(/[^0-9.]/g, '');
    const numericTarget = parseFloat(numericStr);
    if (isNaN(numericTarget)) return;

    const prefix = String(target).match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = String(target).match(/[^0-9.]*$/)?.[0] ?? '';
    const hasComma = numericStr.includes(',');
    const isDecimal = numericStr.includes('.');

    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;

      let formatted: string;
      if (isDecimal) {
        formatted = current.toFixed(numericStr.split('.')[1]?.length ?? 0);
      } else {
        formatted = Math.round(current).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }

      setDisplay(`${prefix}${formatted}${suffix}`);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}

// ---- KPI Card ----

function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color,
  index,
}: {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
  index: number;
}) {
  const IconComp = iconMap[icon] ?? Activity;
  const animatedValue = useAnimatedValue(value);
  const isPositive = change != null && change >= 0;

  return (
    <div
      className="glass-card rounded-xl p-4 sm:p-5 group hover:border-primary/20 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'rounded-lg p-2.5 transition-transform group-hover:scale-110',
            `${color.replace('text-', 'bg-').replace('-500', '-500/10')}`
          )}
        >
          <IconComp className={cn('h-5 w-5', color)} />
        </div>
        {change != null && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {animatedValue}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {changeLabel && (
          <p className="text-[10px] text-muted-foreground/60">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}

// ---- Custom Pie Label ----

const RADIAN = Math.PI / 180;
function renderPieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ---- Format timestamp ----

function formatTime(timestamp: string, t: (path: string, params?: Record<string, string | number>) => string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return t('common.justNow');
  if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('common.daysAgo', { count: diffDays });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---- Main Dashboard ----
export default function DashboardPage() {
  const t = useT();

  const kpisQuery = useDashboardKpis();
  const consumptionQuery = useConsumptionTrend();
  const activityQuery = useRecentActivity();
  const { data: meters } = useMetersList();
  const metersList = meters ?? [];
  const { data: collData } = useQuery({ queryKey: ['coll-dash'], queryFn: () => apiGet<any>('/collections/dashboard') });
  const { data: agingData } = useQuery({ queryKey: ['coll-aging'], queryFn: () => apiGet<any>('/collections/aging') });
  const collections = collData ?? {};
  const aging = agingData ?? {};

  const apiKpis = kpisQuery.data?.kpis;
  const mergedKPIs = apiKpis
    ? ([] as any[])    : [];

  const consumptionData = consumptionQuery.data?.data ?? [];
  const recentActivity = activityQuery.data?.items ?? [];

  const meterStatusData = kpisQuery.data?.meterStatusDistribution
    ? kpisQuery.data.meterStatusDistribution.map(d => ({ name: d.status, value: d.count }))
    : getMeterStatusData(metersList);

  const apiAlertCounts = kpisQuery.data?.alertSeverityCounts;
  const alertSummary = apiAlertCounts
    ? { critical: 0, high: 0, medium: 0, low: 0, ...Object.fromEntries(apiAlertCounts.map(a => [a.severity, a.count])) }
    : getAlertSummary();
  const totalAlerts =
    alertSummary.critical + alertSummary.high + alertSummary.medium + alertSummary.low;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mergedKPIs.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Consumption Chart */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t('dashboard.consumptionTrends')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('dashboard.consumptionSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">{t('dashboard.electricity')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3 w-3 text-emerald-400" />
                <span className="text-muted-foreground">{t('dashboard.water')}</span>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData}>
                <defs>
                  <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3FF12" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A3FF12" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12FFA3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#12FFA3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  tickFormatter={(v: string) => {
                    const parts = v.split('-');
                    const months = [
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    ];
                    return months[parseInt(parts[1], 10) - 1] + " '" + parts[0].slice(2);
                  }}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip formatter={(v: number) => v.toLocaleString()} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="electricity"
                  name={t('dashboard.electricityKwh')}
                  stroke="#A3FF12"
                  strokeWidth={2}
                  fill="url(#elecGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="water"
                  name={t('dashboard.waterM3')}
                  stroke="#12FFA3"
                  strokeWidth={2}
                  fill="url(#waterGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t('dashboard.revenueOverview')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('dashboard.revenueSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                <span className="text-muted-foreground">{t('dashboard.invoices')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                <span className="text-muted-foreground">{t('dashboard.payments')}</span>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(v: number) =>
                        `EGP ${v.toLocaleString()}`
                      }
                    />
                  }
                />
                <Legend content={() => null} />
                <Bar
                  dataKey="invoices"
                  name="Invoices"
                  fill="#A3FF12"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
                <Bar
                  dataKey="payments"
                  name="Payments"
                  fill="#34D399"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meter Status Chart */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t('dashboard.meterStatusDistribution')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('dashboard.totalMeters', { count: metersList.length })}
            </p>
          </div>
          <div className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={meterStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {meterStatusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[entry.name] ?? '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip formatter={(v: number) => `${v} ${t('common.meters')}`} />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {meterStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[entry.name] ?? '#64748B' }}
                />
                <span className="text-muted-foreground capitalize">
                  {entry.name.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Summary */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t('dashboard.alertsSummary')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('dashboard.unacknowledgedAlerts', { count: totalAlerts })}
              </p>
            </div>
            <div className="relative">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center text-white">
                  {totalAlerts}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {(Object.entries(severityConfig) as [keyof typeof severityConfig, typeof severityConfig.critical][]).map(
              ([key, config]) => {
                const count = alertSummary[key];
                const IconComp = config.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-border/20 hover:border-border/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'rounded-lg p-2 border',
                          config.color
                        )}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t('alerts.' + key)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('dashboard.activeAlert', { count })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'text-2xl font-bold',
                          key === 'critical' && 'text-red-400',
                          key === 'high' && 'text-orange-400',
                          key === 'medium' && 'text-yellow-400',
                          key === 'low' && 'text-sky-400'
                        )}
                      >
                        {count}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('dashboard.recentActivity')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('dashboard.recentActivitySubtitle')}
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {recentActivity.map((item, idx) => {
            const IconComp = activityIconMap[item.type] ?? Activity;
            const colorClass = activityColorMap[item.type] ?? 'text-slate-400 bg-slate-400/10';

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors group"
              >
                {/* Timeline connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'rounded-full p-2 transition-transform group-hover:scale-110',
                      colorClass
                    )}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  {idx < recentActivity.length - 1 && (
                    <div className="w-px h-full min-h-[8px] bg-border/30 mt-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">
                      {formatTime(item.timestamp, t)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
