import type { NavItem, RolePermissions, UserRole } from '@/lib/types';

// ============================================
// Navigation Configuration
// ============================================

/**
 * Complete navigation tree for the sidebar.
 * Each item uses a Lucide icon name as a string.
 */
export const allNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    children: [
      { title: 'Executive', href: '/executive-dashboard', icon: 'BarChart3' },
      { title: 'Operations', href: '/operations-dashboard', icon: 'Activity' },
      { title: 'Billing', href: '/billing-dashboard', icon: 'Receipt' },
      { title: 'Collections', href: '/collections-dashboard-plus', icon: 'Banknote' },
      { title: 'Utilities', href: '/utility-dashboard', icon: 'Zap' },
      { title: 'KPI Executive', href: '/kpi-executive', icon: 'BarChart3' },
      { title: 'KPI Collections', href: '/kpi-collections', icon: 'Banknote' },
      { title: 'KPI Utilities', href: '/kpi-utilities', icon: 'Zap' },
    ],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: 'Users',
    children: [
      { title: 'Customer List', href: '/customers', icon: 'List' },
      { title: 'Statements', href: '/balances', icon: 'FileText' },
      { title: 'Documents', href: '/downloads', icon: 'Download' },
    ],
  },
  {
    title: 'Units',
    href: '/locations',
    icon: 'MapPin',
  },
  {
    title: 'Meters',
    href: '/meters',
    icon: 'Gauge',
    children: [
      { title: 'All Meters', href: '/meters', icon: 'List' },
      { title: 'Assign Meter', href: '/meters/assign', icon: 'Link' },
      { title: 'Replace Meter', href: '/meters/replace', icon: 'RefreshCw' },
      { title: 'Terminate Meter', href: '/meters/terminate', icon: 'XCircle' },
    ],
  },
  {
    title: 'Readings',
    href: '/readings',
    icon: 'FileText',
    children: [
      { title: 'All Readings', href: '/readings', icon: 'List' },
      { title: 'New Reading', href: '/readings/new', icon: 'PlusCircle' },
    ],
  },
  {
    title: 'Billing',
    href: '/invoices',
    icon: 'Receipt',
    children: [
      { title: 'Invoices', href: '/invoices', icon: 'Receipt' },
      { title: 'Adjustments', href: '/adjustments', icon: 'Scale' },
    ],
  },
  {
    title: 'Tariff Studio',
    href: '/tariff-studio',
    icon: 'DollarSign',
  },
  {
    title: 'Bill Cycle',
    href: '/bill-cycle',
    icon: 'RefreshCw',
  },
  {
    title: 'Collections',
    href: '/collections',
    icon: 'Banknote',
    children: [
      { title: 'Payments', href: '/payments', icon: 'Banknote' },
      { title: 'Aging', href: '/collections-dashboard-plus', icon: 'BarChart3' },
      { title: 'Promises', href: '/promises', icon: 'Clock' },
      { title: 'Recovery', href: '/recovery', icon: 'RefreshCw' },
    ],
  },
  {
    title: 'Utilities',
    href: '/utility-dashboard',
    icon: 'Zap',
    children: [
      { title: 'Electricity', href: '/utility/electricity', icon: 'Zap' },
      { title: 'Water', href: '/utility/water', icon: 'Droplets' },
      { title: 'Solar', href: '/utility/solar', icon: 'Sun' },
      { title: 'Gas', href: '/utility/gas', icon: 'Flame' },
      { title: 'Chilled Water', href: '/utility/chilled-water', icon: 'Thermometer' },
      { title: 'Outdoor Units', href: '/utility/outdoor-unit', icon: 'Wind' },
      { title: 'Settlement', href: '/utility/settlement', icon: 'RefreshCw' },
    ],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    children: [
      { title: 'Operational', href: '/reports/operational', icon: 'Activity' },
      { title: 'Financial', href: '/reports/financial', icon: 'DollarSign' },
      { title: 'Collections', href: '/reports/collections', icon: 'Banknote' },
      { title: 'Utility', href: '/reports/utility', icon: 'Zap' },
      { title: 'Regulatory', href: '/reports/regulatory', icon: 'Shield' },
    ],
  },
  {
    title: 'Upload Center',
    href: '/upload-center',
    icon: 'Upload',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: 'Bell',
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: 'MessageSquare',
  },
  {
    title: 'Support',
    href: '/support',
    icon: 'Headphones',
  },
  {
    title: 'Workplace',
    href: '/workplace',
    icon: 'Briefcase',
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: 'Shield',
    children: [
      { title: 'RBAC', href: '/rbac', icon: 'Shield' },
      { title: 'Feature Flags', href: '/feature-flags', icon: 'Flag' },
      { title: 'Audit Logs', href: '/audit-logs', icon: 'FileText' },
      { title: 'Sync Gateway', href: '/sync-gateway', icon: 'Server' },
    ],
  },
];

// ============================================
// Role Permissions
// ============================================

/**
 * Maps each role to its allowed navigation hrefs.
 * Wildcards like "meters/*" grant access to the parent
 * path and every child path under it.
 */
export const rolePermissions: RolePermissions = {
  super_admin: [
    'dashboard',
    'executive-dashboard',
    'operations-dashboard',
    'billing-dashboard',
    'collections-dashboard-plus',
    'utility-dashboard',
    'solar-dashboard',
    // 'projects',
    'locations',
    'customers',
    'meters/*',
    'sim-cards',
    'readings/*',
    'consumption',
    'water-balance',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
    'alerts',
    'tickets',
    'support',
    'settings',
    'upload-center',
    'tariff-studio',
    'settlements',
    'workplace',
  ],
  system_admin: [
    'dashboard',
    // 'projects',
    'locations',
    'customers',
    'meters/*',
    'sim-cards',
    'readings/*',
    'consumption',
    'water-balance',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
    'alerts',
    'tickets',
    'support',
    'settings',
  ],
  admin: [
    'dashboard',
    // 'projects',
    'locations',
    'customers',
    'meters/*',
    'sim-cards',
    'readings/*',
    'consumption',
    'water-balance',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
    'alerts',
    'tickets',
    'support',
    'settings',
  ],
  area_manager: [
    'dashboard',
    // 'projects',
    'locations',
    'customers',
    'meters/*',
    'readings/*',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
    'alerts',
    'tickets',
  ],
  team_leader: [
    'dashboard',
    // 'projects',
    'customers',
    'meters/*',
    'readings/*',
    'invoices/*',
    'payments',
    'reports/*',
    'alerts',
    'tickets',
  ],
  operator: [
    'dashboard',
    'customers',
    'meters/*',
    'readings/*',
    'sim-cards',
    'locations',
    'invoices/*',
    'payments',
    'alerts',
    'tickets',
  ],
  technician: [
    'dashboard',
    'meters/*',
    'sim-cards',
    'readings/*',
    'tickets',
    'alerts',
  ],
  finance: [
    'dashboard',
    'customers',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
  ],
  support: [
    'dashboard',
    'customers',
    'readings/*',
    'invoices/*',
    'payments',
    'tickets',
    'alerts',
    'support',
  ],
  customer: [
    'dashboard',
    'consumption',
    'water-balance',
    'invoices/*',
    'payments',
    'balances',
    'support',
  ],
  collector: [
    'dashboard',
    'customers',
    'meters/*',
    'invoices/*',
    'payments',
  ],
  meter_reader: [
    'dashboard',
    'meters/*',
    'readings/*',
  ],
  inspector: [
    'dashboard',
    'meters/*',
    'readings/*',
    'tickets',
    'alerts',
    'reports/*',
  ],
  supervisor: [
    'dashboard',
    // 'projects',
    'customers',
    'meters/*',
    'readings/*',
    'invoices/*',
    'payments',
    'reports/*',
    'alerts',
    'tickets',
  ],
  accountant: [
    'dashboard',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
  ],
  viewer: [
    'dashboard',
    // 'projects',
    'customers',
    'meters/*',
    'readings/*',
    'invoices/*',
    'payments',
    'balances',
    'reports/*',
    'alerts',
    'tickets',
  ],
};

// ============================================
// Permission Helpers
// ============================================

/**
 * Resolves a permission pattern against an href.
 * - "meters/*" matches "meters", "meters/assign", "meters/replace", etc.
 * - "dashboard" matches "dashboard" exactly.
 */
function permissionMatches(perm: string, normalizedHref: string): boolean {
  if (perm.endsWith('/*')) {
    const prefix = perm.slice(0, -2);
    return normalizedHref === prefix || normalizedHref.startsWith(prefix + '/');
  }
  return normalizedHref === perm;
}

function hrefMatchesRole(role: UserRole, href: string): boolean {
  const permissions = rolePermissions[role] ?? [];
  const normalizedHref = href.replace(/^\//, '');
  return permissions.some((perm) => permissionMatches(perm, normalizedHref));
}

// ============================================
// Navigation Filtering
// ============================================

/**
 * Returns the navigation tree filtered to only show items
 * that the given role is permitted to access.
 * Parent items with children are shown as long as at least
 * one child is permitted.
 */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  return allNavItems
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hrefMatchesRole(role, child.href),
        );
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }
      return hrefMatchesRole(role, item.href);
    });
}

// ============================================
// Page Title / Breadcrumb
// ============================================

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your system' },
  // '/projects': { title: 'Projects', subtitle: 'Manage your projects' },
  '/locations': { title: 'Locations', subtitle: 'Manage locations and buildings' },
  '/customers': { title: 'Customers', subtitle: 'Manage customer accounts' },
  '/meters': { title: 'Meters', subtitle: 'Manage water and electricity meters' },
  '/meters/assign': { title: 'Assign Meter', subtitle: 'Assign a meter to a unit' },
  '/meters/replace': { title: 'Replace Meter', subtitle: 'Replace an existing meter' },
  '/meters/terminate': { title: 'Terminate Meter', subtitle: 'Terminate a meter connection' },
  '/sim-cards': { title: 'SIM Cards', subtitle: 'Manage SIM cards for meters' },
  '/readings': { title: 'Readings', subtitle: 'View and manage meter readings' },
  '/readings/new': { title: 'New Reading', subtitle: 'Submit a new meter reading' },
  '/consumption': { title: 'Consumption', subtitle: 'Monitor consumption trends' },
  '/water-balance': { title: 'Water Balance', subtitle: 'Track water balance and losses' },
  '/invoices': { title: 'Invoices', subtitle: 'Manage billing invoices' },
  '/payments': { title: 'Payments', subtitle: 'Track and manage payments' },
  '/balances': { title: 'Balances', subtitle: 'View customer balances and aging' },
  '/reports': { title: 'Reports', subtitle: 'Generate and view reports' },
  '/alerts': { title: 'Alerts', subtitle: 'Monitor system alerts' },
  '/tickets': { title: 'Tickets', subtitle: 'Manage support tickets' },
  '/support': { title: 'Support', subtitle: 'Customer support center' },
  '/settings': { title: 'Settings', subtitle: 'System configuration' },
};

/**
 * Returns the title and subtitle for a given route path,
 * used for page headings and breadcrumbs.
 */
export function getPageTitle(
  path: string,
): { title: string; subtitle: string } {
  return pageTitles[path] ?? { title: 'Page', subtitle: '' };
}
