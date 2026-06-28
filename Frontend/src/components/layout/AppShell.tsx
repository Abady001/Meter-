'use client';

import React, { useState, useEffect } from 'react';
import { usePageStore, type PageKey } from '@/lib/router-store';
import { useAuthStore } from '@/lib/mock-auth';
import { TopNav } from './TopNav';
import { AppSidebar } from './AppSidebar';


// Dashboard
import DashboardPage from '@/components/dashboard/DashboardPage';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import OperationsDashboard from '@/components/dashboard/OperationsDashboard';
import BillingDashboard from '@/components/dashboard/BillingDashboard';
import CollectionsDashboardPlus from '@/components/dashboard/CollectionsDashboardPlus';
import UtilityDashboard from '@/components/dashboard/UtilityDashboard';
import SolarDashboard from '@/components/dashboard/SolarDashboard';
import KpiExecutiveDashboard from '@/components/kpi/ExecutiveDashboard';
import KpiCollectionsDashboard from '@/components/kpi/CollectionsDashboard';
import KpiUtilitiesDashboard from '@/components/kpi/UtilitiesDashboard';
import SyncGatewayPage from '@/components/sync/SyncGatewayPage';

import LocationsPage from '@/components/projects/LocationsPage';

// Customers
import CustomersPage from '@/components/customers/CustomersPage';
import CustomerDetailPage from '@/components/customers/CustomerDetailPage';
import NewCustomerPage from '@/components/customers/NewCustomerPage';


// Meters
import MetersPage from '@/components/meters/MetersPage';
import MeterDetailPage from '@/components/meters/MeterDetailPage';
import MeterAssignPage from '@/components/meters/MeterAssignPage';
import MeterReplacePage from '@/components/meters/MeterReplacePage';
import MeterTerminatePage from '@/components/meters/MeterTerminatePage';

// SIM Cards
import SimCardsPage from '@/components/sim-cards/SimCardsPage';

// Readings
import ReadingsPage from '@/components/readings/ReadingsPage';
import ReadingNewPage from '@/components/readings/ReadingNewPage';

// Billing
import ConsumptionPage from '@/components/billing/ConsumptionPage';
import WaterBalancePage from '@/components/billing/WaterBalancePage';
import InvoicesPage from '@/components/billing/InvoicesPage';
import InvoiceDetailPage from '@/components/billing/InvoiceDetailPage';
import PaymentsPage from '@/components/billing/PaymentsPage';
import BalancesPage from '@/components/billing/BalancesPage';
import BillCycleComponent from '@/components/billing/BillCyclePage';
import PaymentWizardPage from '@/components/billing/PaymentWizardPage';

// Reports
import ReportsPage from '@/components/reports/ReportsPage';

// Alerts
import AlertsPage from '@/components/alerts/AlertsPage';

// Tickets & Support
import TicketsPage from '@/components/tickets/TicketsPage';
import SupportPage from '@/components/tickets/SupportPage';

import { useT } from '@/lib/i18n/context';
import { useIsMobile } from '@/hooks/use-mobile';
import GlobalSearchDialog from '@/components/shared/GlobalSearchDialog';
import UploadCenterPage from '@/components/upload/UploadCenterPage';
import TariffStudioPage from '@/components/tariffs/TariffStudioPage';
import WorkplacePage from '@/components/workspace/WorkplacePage';
import SettlementPage from '@/components/settlement/SettlementPage';

export function AppShell() {
  const currentPage = usePageStore((s) => s.currentPage);
  const { navigate } = usePageStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const restore = useAuthStore((s) => s.restore);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { (window as any).__navigate = navigate; }, [navigate]);

  // Restore auth from server-side JWT validation
  useEffect(() => {
    const token = localStorage.getItem('mp-auth-token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    if (!isAuthenticated) {
      restore().catch(() => {
        localStorage.removeItem('mp-auth-token');
        window.location.href = '/login';
      });
    }
  }, []);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close mobile sidebar on page change
  const [prevPage, setPrevPage] = useState(currentPage);
  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }

  // Reset collapsed state when switching to mobile
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile);
  if (isMobile !== prevIsMobile) {
    setPrevIsMobile(isMobile);
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }

  // Not authenticated → show loading spinner while restore() runs
  if (!isAuthenticated) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--background,#F8FAFC)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,border:'3px solid var(--border,#E2E8F0)',borderTopColor:'var(--primary,#65A30D)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}} />
          <p style={{color:'var(--muted-foreground,#64748B)',fontSize:14}}>Loading...</p>
        </div>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  // Compute main content margin based on sidebar state
  const contentMarginStart = isMobile ? 0 : sidebarCollapsed ? 64 : 256;

  // Map currentPage to the correct component
  const pageComponent = renderPage(currentPage);

  return (
    <div className="min-h-screen bg-background">
      <GlobalSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginInlineStart: contentMarginStart }}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {pageComponent}
        </div>
      </main>
    </div>
  );
}

// ---- Page Router ----
function renderPage(page: PageKey): React.ReactNode {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'executive-dashboard':
      return <ExecutiveDashboard />;
    case 'operations-dashboard':
      return <OperationsDashboard />;
    case 'billing-dashboard':
      return <BillingDashboard />;
    case 'collections-dashboard-plus':
      return <CollectionsDashboardPlus />;
    case 'utility-dashboard':
      return <UtilityDashboard />;
    case 'solar-dashboard':
      return <SolarDashboard />;
    case 'kpi-executive':
      return <KpiExecutiveDashboard />;
    case 'kpi-collections':
      return <KpiCollectionsDashboard />;
    case 'kpi-utilities':
      return <KpiUtilitiesDashboard />;
    case 'sync-gateway':
      return <SyncGatewayPage />;

    case 'project-detail':
      return <div className="p-6 text-muted-foreground">Project details have moved to the Administration Portal</div>;
    case 'locations':
      return <LocationsPage />;

    case 'customers':
      return <CustomersPage />;

    case 'customer-detail':
      return <CustomerDetailPage />;

    case 'customer-new':
      return <NewCustomerPage />;
    case 'meters':
      return <MetersPage />;

    case 'meter-detail':
      return <MeterDetailPage />;

    case 'meter-assign':
      return <MeterAssignPage />;

    case 'meter-replace':
      return <MeterReplacePage />;

    case 'meter-terminate':
      return <MeterTerminatePage />;

    case 'sim-cards':
      return <SimCardsPage />;

    case 'readings':
      return <ReadingsPage />;

    case 'reading-new':
      return <ReadingNewPage />;

    case 'consumption':
      return <ConsumptionPage />;

    case 'water-balance':
      return <WaterBalancePage />;

    case 'invoices':
      return <InvoicesPage />;

    case 'invoice-detail':
      return <InvoiceDetailPage />;

    case 'payments':
      return <PaymentsPage />;

    case 'payment-new':
      return <PaymentWizardPage />;

    case 'balances':
      return <BalancesPage />;

    case 'reports':
      return <ReportsPage />;

    case 'alerts':
      return <AlertsPage />;

    case 'tickets':
      return <TicketsPage />;

    case 'support':
      return <SupportPage />;

    case 'settings':
    case 'admin-portal':
      return <AdminPortalRedirect />;
    case 'bill-cycle':
      return <BillCyclePage />;
    case 'upload-center':
      return <UploadCenterPage />;
    case 'tariff-studio':
      return <TariffStudioPage />;
    case 'settlements':
      return <SettlementPage />;
    case 'workplace':
      return <WorkplacePage />;

    default:
      return <DefaultNotFound />;
  }
}

function AdminPortalRedirect() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-xl font-semibold mb-2">Administration Portal</h2>
        <p className="text-muted-foreground mb-4">System settings and governance have moved to the Administration Portal.</p>
        <a href="http://localhost:6262" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Open Administration Portal (Port 6262)
        </a>
        <p className="text-xs text-muted-foreground mt-3">Login with your admin credentials</p>
      </div>
    </div>
  );
}

function BillCyclePage() { return <BillCycleComponent />; }

function DefaultNotFound() {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground">{t('nav.pageNotFound')}</p>
    </div>
  );
}
