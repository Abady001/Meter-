'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  FileText,
  Inbox,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ---- StatusBadge ----

const defaultStatusColorMap: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  available: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  assigned: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  offline: 'bg-red-500/15 text-red-400 border-red-500/30',
  faulty: 'bg-red-500/15 text-red-400 border-red-500/30',
  replaced: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  terminated: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  retired: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  suspended: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  reusable: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  old: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  valid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending_review: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  estimated: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  suspicious: 'bg-red-500/15 text-red-400 border-red-500/30',
  corrected: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  issued: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  partially_paid: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reversed: 'bg-red-500/15 text-red-400 border-red-500/30',
  open: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  waiting: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  vacant: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  occupied: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  maintenance: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

export function StatusBadge({
  value,
  colorMap,
}: {
  value: string;
  colorMap?: Record<string, string>;
}) {
  const allColors = { ...defaultStatusColorMap, ...colorMap };
  const colorClass = allColors[value] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium border', colorClass)}
    >
      {value.replace(/_/g, ' ')}
    </Badge>
  );
}

// ---- Types ----

export interface SmartTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => ReactNode;
}

export interface SmartTableFilter {
  key: string;
  label: string;
  type?: string;
  options: { label: string; value: string }[];
}

export interface SmartTableProps<T = any> {
  data: T[];
  columns: SmartTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: SmartTableFilter[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  title?: string;
  badgeColumn?: string;
  badgeColorMap?: Record<string, string>;
  groupBy?: string;
  exportable?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

// ---- Component ----

export default function SmartTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  filters = [],
  onRowClick,
  actions,
  pagination = true,
  pageSize = 10,
  emptyMessage = 'No data found',
  loading = false,
  title,
  badgeColumn,
  badgeColorMap,
  groupBy,
  exportable = false,
}: SmartTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Filtering ----
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Global search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          if (val == null) return false;
          return String(val).toLowerCase().includes(q);
        })
      );
    }

    // Column filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((row) => String(row[key]) === value);
      }
    });

    return result;
  }, [data, searchQuery, filterValues, columns]);

  // ---- Sorting ----
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortDir === 'asc') return aStr.localeCompare(bStr);
      return bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortDir]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = pagination
    ? sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sortedData;

  // Reset to page 1 when filters/search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        if (sortDir === 'asc') setSortDir('desc');
        else if (sortDir === 'desc') {
          setSortKey(null);
          setSortDir(null);
        }
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey, sortDir]
  );

  const handleExport = useCallback(() => {
    toast.info('Export coming soon');
  }, []);

  // ---- Grouped Data ----
  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, T[]> = {};
    paginatedData.forEach((row) => {
      const groupVal = String(row[groupBy] ?? 'Other');
      if (!groups[groupVal]) groups[groupVal] = [];
      groups[groupVal].push(row);
    });
    return groups;
  }, [paginatedData, groupBy]);

  // ---- Loading Skeleton ----
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        {title && (
          <Skeleton className="h-6 w-48 mb-4 bg-white/5" />
        )}
        {searchable && (
          <Skeleton className="h-10 w-full max-w-sm mb-4 bg-white/5" />
        )}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {columns.map((_, j) => (
                <Skeleton
                  key={j}
                  className="h-5 flex-1 bg-white/5"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Empty State ----
  if (sortedData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {title}
          </h3>
        )}
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <Inbox className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">{emptyMessage}</p>
          <p className="text-xs mt-1 opacity-70">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  // ---- Sort icon helper ----
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    }
    if (sortDir === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />;
  };

  // ---- Render cell ----
  const renderCell = (col: SmartTableColumn<T>, row: T) => {
    const value = row[col.key];

    if (col.render) return col.render(value, row);

    // Badge column
    if (badgeColumn && col.key === badgeColumn && value != null) {
      return <StatusBadge value={String(value)} colorMap={badgeColorMap} />;
    }

    return (
      <span className="text-sm text-foreground/80">
        {value != null ? String(value) : '—'}
      </span>
    );
  };

  // ---- Mobile card render ----
  const renderMobileRow = (row: T, idx: number) => (
    <div
      key={`mobile-${idx}-${String(row.id ?? idx)}`}
      className={cn(
        'glass-card rounded-lg p-4 space-y-3 border border-border/30',
        onRowClick && 'cursor-pointer hover:border-primary/30 transition-colors'
      )}
      onClick={() => onRowClick?.(row)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          {columns.slice(0, 3).map((col) => (
            <div key={col.key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">
                {col.label}:
              </span>
              <span className="text-sm text-foreground truncate">
                {renderCell(col, row)}
              </span>
            </div>
          ))}
        </div>
        {actions && (
          <div className="ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {actions(row)}
          </div>
        )}
      </div>
      {columns.length > 3 && (
        <div className="grid grid-cols-2 gap-2">
          {columns.slice(3, 7).map((col) => (
            <div key={col.key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">
                {col.label}:
              </span>
              <span className="text-sm text-foreground truncate">
                {renderCell(col, row)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ---- Desktop table row render ----
  const renderDesktopRow = (row: T, idx: number) => (
    <TableRow
      key={`desktop-${idx}-${String(row.id ?? idx)}`}
      className={cn(
        'border-border/30 hover:bg-muted/20 transition-colors',
        onRowClick && 'cursor-pointer'
      )}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map((col) => (
        <TableCell key={col.key} className="py-3 px-4 text-foreground/80">
          {renderCell(col, row)}
        </TableCell>
      ))}
      {actions && (
        <TableCell className="py-3 px-4 w-[50px]" onClick={(e) => e.stopPropagation()}>
          {actions(row)}
        </TableCell>
      )}
    </TableRow>
  );

  // ---- Main Render ----
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-0 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 h-9 w-full sm:w-[220px] bg-white/5 border-border/40 text-sm"
                />
              </div>
            )}
            {exportable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-border/40 text-xs"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport()}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={filterValues[filter.key] ?? 'all'}
                onValueChange={(v) => handleFilterChange(filter.key, v)}
              >
                <SelectTrigger className="h-8 w-[160px] bg-white/5 border-border/40 text-xs">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((opt, oi) => (
                    <SelectItem key={opt.value ?? `opt-${oi}`} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
                    col.sortable && sortKey === col.key && 'text-primary'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="py-3 px-4 w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData
              ? Object.entries(groupedData).map(([groupLabel, rows]) => (
                  <React.Fragment key={groupLabel}>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length + (actions ? 1 : 0)}
                        className="py-2 px-4 bg-muted/10 font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                      >
                        {groupLabel}
                      </TableCell>
                    </TableRow>
                    {rows.map((row, i) => renderDesktopRow(row, i))}
                  </React.Fragment>
                ))
              : paginatedData.map((row, idx) => renderDesktopRow(row, idx))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        {paginatedData.map((row, idx) => renderMobileRow(row, idx))}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/40"
              onClick={() => setCurrentPage(1)}
              disabled={safePage <= 1}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/40"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage >= totalPages}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// StatusBadge is already exported above
