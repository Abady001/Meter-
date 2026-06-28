'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  Gauge,
  MapPin,
  Wifi,
  FileText,
  Activity,
  Droplets,
  Receipt,
  Banknote,
  Scale,
  BarChart3,
  Bell,
  MessageSquare,
  Headphones,
  Settings,
  List,
  Link,
  RefreshCw,
  XCircle,
  PlusCircle,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Flame,
  Thermometer,
  Wind,
  DollarSign,
  Upload,
  Database,
  Flag,
  Download,
  Clock,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore, getRoleColor, getRoleLabel } from '@/lib/mock-auth';
import { getNavItemsForRole } from '@/lib/navigation';
import { useLocale, useT } from '@/lib/i18n/context';
import { usePageStore, type PageKey } from '@/lib/router-store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NavItem } from '@/lib/types';

// ---- Icon Mapping ----
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Users,
  Gauge,
  MapPin,
  Wifi,
  FileText,
  Activity,
  Droplets,
  Receipt,
  Banknote,
  Scale,
  BarChart3,
  Bell,
  MessageSquare,
  Headphones,
  Settings,
  List,
  Link,
  RefreshCw,
  XCircle,
  PlusCircle,
  Zap,
  Sun,
  Flame,
  Thermometer,
  Wind,
  DollarSign,
  Upload,
  Database,
  Flag,
  Download,
  Clock,
  Shield,
};

// ---- Navigation href → PageKey mapping ----
const hrefToPageKey: Record<string, PageKey> = {
  '/dashboard': 'dashboard',
  '/executive-dashboard': 'executive-dashboard',
  '/operations-dashboard': 'operations-dashboard',
  '/billing-dashboard': 'billing-dashboard',
  '/collections-dashboard-plus': 'collections-dashboard-plus',
  '/utility-dashboard': 'utility-dashboard',
  '/solar-dashboard': 'solar-dashboard',
  '/kpi-executive': 'kpi-executive',
  '/kpi-collections': 'kpi-collections',
  '/kpi-utilities': 'kpi-utilities',
  '/sync-gateway': 'sync-gateway',

  '/upload-center': 'upload-center',
  '/locations': 'locations',
  '/customers': 'customers',
  '/customer-new': 'customer-new',
  '/meters': 'meters',
  '/meters/assign': 'meter-assign',
  '/meters/replace': 'meter-replace',
  '/meters/terminate': 'meter-terminate',
  '/sim-cards': 'sim-cards',
  '/readings': 'readings',
  '/readings/new': 'reading-new',
  '/consumption': 'consumption',
  '/water-balance': 'water-balance',
  '/invoices': 'invoices',
  '/payments': 'payments',
  '/payment-new': 'payment-new',
  '/balances': 'balances',
  '/reports': 'reports',
  '/alerts': 'alerts',
  '/tickets': 'tickets',
  '/support': 'support',
  '/settings': 'admin-portal',
  '/downloads': 'admin-portal',

  '/collections': 'collections-dashboard-plus',
  '/utility/electricity': 'utility-dashboard',
  '/utility/water': 'utility-dashboard',
  '/utility/solar': 'utility-dashboard',
  '/utility/gas': 'utility-dashboard',
  '/utility/chilled-water': 'utility-dashboard',
  '/utility/outdoor-unit': 'utility-dashboard',
  '/utility/settlement': 'utility-dashboard',
  '/reports/operational': 'reports',
  '/reports/financial': 'reports',
  '/reports/collections': 'reports',
  '/reports/utility': 'reports',
  '/reports/regulatory': 'reports',
  '/adjustments': 'invoices',
  '/templates': 'admin-portal',
  '/promises': 'payments',
  '/recovery': 'collections-dashboard-plus',
  '/rbac': 'admin-portal',
  '/feature-flags': 'admin-portal',
  '/audit-logs': 'admin-portal',
  '/notifications': 'admin-portal',
  '/settlements': 'settlements',
  '/workplace': 'workplace',
};

// ---- PageKey → href mapping (for active state checking) ----
const pageKeyToHref: Record<PageKey, string> = {
  login: '/',
  dashboard: '/dashboard',
  projects: '/projects',
  'project-detail': '/projects',
  locations: '/locations',
  customers: '/customers',
  'customer-detail': '/customers',
  meters: '/meters',
  'meter-detail': '/meters',
  'meter-assign': '/meters/assign',
  'meter-replace': '/meters/replace',
  'meter-terminate': '/meters/terminate',
  'sim-cards': '/sim-cards',
  readings: '/readings',
  'reading-new': '/readings/new',
  consumption: '/consumption',
  'water-balance': '/water-balance',
  invoices: '/invoices',
  'invoice-detail': '/invoices',
  payments: '/payments',
  balances: '/balances',
  reports: '/reports',
  alerts: '/alerts',
  tickets: '/tickets',
  support: '/support',
  settings: '/settings',
  'admin-portal': '/settings',
  'bill-cycle': '/bill-cycle',
  'executive-dashboard': '/executive-dashboard',
  'operations-dashboard': '/operations-dashboard',
  'billing-dashboard': '/billing-dashboard',
  'collections-dashboard-plus': '/collections-dashboard-plus',
  'utility-dashboard': '/utility-dashboard',
  'solar-dashboard': '/solar-dashboard',
  'kpi-executive': '/kpi-executive',
  'kpi-collections': '/kpi-collections',
  'kpi-utilities': '/kpi-utilities',
  'sync-gateway': '/sync-gateway',
  'project-detail': '/project-detail',
  'upload-center': '/upload-center',
  'tariff-studio': '/tariff-studio',
  'settlements': '/settlements',
  'workplace': '/workplace',
};

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  currentPage: PageKey;
  navigate: (page: PageKey) => void;
  onClose?: () => void;
}

const titleToTKey: Record<string, string> = {
  'Dashboard': 'sidebar.dashboard',
  // 'Projects': 'sidebar.projects',
  'Locations': 'sidebar.locations',
  'Customers': 'sidebar.customers',
  'Meters': 'sidebar.meters',
  'SIM Cards': 'sidebar.simCards',
  'Readings': 'sidebar.readings',
  'Consumption': 'sidebar.consumption',
  'Water Balance': 'sidebar.waterBalance',
  'Invoices': 'sidebar.invoices',
  'Payments': 'sidebar.payments',
  'Balances': 'sidebar.balances',
  'Reports': 'sidebar.reports',
  'Alerts': 'sidebar.alerts',
  'Tickets': 'sidebar.tickets',
  'Support': 'sidebar.support',
  'Settings': 'sidebar.settings',
  'All Meters': 'sidebar.allMeters',
  'Assign Meter': 'meters.assign.title',
  'Replace Meter': 'meters.replace.title',
  'Terminate Meter': 'meters.terminate.title',
  'All Readings': 'sidebar.allReadings',
  'New Reading': 'readings.newReading',
};

function SidebarItem({ item, isActive, isCollapsed, currentPage, navigate, onClose }: SidebarItemProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isParentActive = hasChildren && item.children!.some((c) => {
    const key = hrefToPageKey[c.href];
    return key && pageKeyToHref[currentPage]?.startsWith(c.href.replace(/\/$/, ''));
  });

  const Icon = iconMap[item.icon] ?? Zap;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else {
      const pageKey = hrefToPageKey[item.href];
      if (pageKey) {
        navigate(pageKey);
        onClose?.();
      }
    }
  };

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                'flex flex-col items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-200',
                isActive || isParentActive
                  ? 'bg-primary/10 text-primary neon-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className="size-5 shrink-0" />
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {t(titleToTKey[item.title] || item.title)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
          isActive || isParentActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className="flex-1 text-start truncate">{t(titleToTKey[item.title] || item.title)}</span>
        {item.badge && (
          <Badge className="bg-destructive/80 text-white border-0 text-[10px] px-1.5 py-0 h-4">
            {item.badge}
          </Badge>
        )}
        {hasChildren && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="size-4 opacity-60" />
          </motion.div>
        )}
      </button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ms-5 ps-4 border-s border-border/50 space-y-0.5 mt-0.5 mb-1">
              {item.children!.map((child) => {
                const childPageKey = hrefToPageKey[child.href];
                const childActive = childPageKey === currentPage;
                const ChildIcon = iconMap[child.icon] ?? List;

                return (
                  <button
                    key={child.href}
                    onClick={() => {
                      if (childPageKey) {
                        navigate(childPageKey);
                        onClose?.();
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      childActive
                        ? 'text-primary font-medium bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                    )}
                  >
                    <ChildIcon className="size-4 shrink-0" />
                    <span className="truncate">{t(titleToTKey[child.title] || child.title)}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Main Sidebar Component ----
interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const user = useAuthStore((s) => s.user);
  const currentPage = usePageStore((s) => s.currentPage);
  const navigate = usePageStore((s) => s.navigate);
  const isMobile = useIsMobile();
  const { dir } = useLocale();
  const sidebarOffset = dir === 'rtl' ? 280 : -280;

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Mobile sidebar: overlay drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: sidebarOffset }}
              animate={{ x: 0 }}
              exit={{ x: sidebarOffset }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-inline-start-0 top-16 bottom-0 z-50 w-64 glass-card border-e border-border flex flex-col"
            >
              <SidebarContent
                navItems={navItems}
                currentPage={currentPage}
                navigate={navigate}
                onClose={onClose}
                user={user}
                initials={initials}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar: fixed with collapse support
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="fixed inset-inline-start-0 top-16 bottom-0 z-30 glass-card border-e border-border flex flex-col overflow-hidden"
    >
      <SidebarContent
        navItems={navItems}
        currentPage={currentPage}
        navigate={navigate}
        user={user}
        initials={initials}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </motion.aside>
  );
}

interface SidebarContentProps {
  navItems: NavItem[];
  currentPage: PageKey;
  navigate: (page: PageKey) => void;
  onClose?: () => void;
  user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>;
  initials: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  navItems,
  currentPage,
  navigate,
  onClose,
  user,
  initials,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarContentProps) {
  const { dir } = useLocale();
  const ExpandIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const CollapseIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center pt-4 gap-2 flex-1">
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors mb-2"
        >
          <ExpandIcon className="size-4" />
        </button>

        <Separator className="w-8 mx-auto" />

        {/* Nav items as icons only */}
        <ScrollArea className="flex-1 w-full px-2 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const pageKey = hrefToPageKey[item.href];
              const isActive = pageKey === currentPage;
              return (
                <SidebarItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  isCollapsed
                  currentPage={currentPage}
                  navigate={navigate}
                  onClose={onClose}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* User avatar at bottom */}
        <Separator className="w-8 mx-auto" />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center py-3 px-2">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side={dir === 'rtl' ? 'left' : 'right'}>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Spacer with collapse toggle */}
      <div className="flex items-center justify-end px-4 pt-2 pb-1">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <CollapseIcon className="size-4" />
          </button>
        )}
        {!onToggleCollapse && <div className="h-7"></div>}
      </div>
      <Separator className="mx-3" />

      {/* Navigation items */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5" aria-label="Main navigation">
          {navItems.map((item) => {
            const pageKey = hrefToPageKey[item.href];
            const isActive = pageKey === currentPage;
            return (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={isActive}
                isCollapsed={false}
                currentPage={currentPage}
                navigate={navigate}
                onClose={onClose}
              />
            );
          })}
        </nav>
      </ScrollArea>

      {/* User info at bottom */}
      <Separator />
      <div className="px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-secondary/30">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 h-4 border-0', getRoleColor(user.role))}
            >
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
