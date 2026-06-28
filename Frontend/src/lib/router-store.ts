'use client';

import { create } from 'zustand';

export type PageKey =
  | 'login'
  | 'dashboard'
  | 'executive-dashboard'
  | 'operations-dashboard'
  | 'billing-dashboard'
  | 'collections-dashboard-plus'
  | 'utility-dashboard'
  | 'solar-dashboard'
  | 'projects'
  | 'project-detail'
  | 'locations'
  | 'customers'
  | 'customer-detail'
  | 'customer-new'
  | 'meters'
  | 'meter-detail'
  | 'meter-assign'
  | 'meter-replace'
  | 'meter-terminate'
  | 'sim-cards'
  | 'readings'
  | 'reading-new'
  | 'consumption'
  | 'water-balance'
  | 'invoices'
  | 'invoice-detail'
  | 'payments'
  | 'balances'
  | 'reports'
  | 'alerts'
  | 'tickets'
  | 'support'
  | 'settings'
  | 'upload-center'
  | 'tariff-studio'
  | 'settlements'
  | 'workplace'
  | 'kpi-executive'
  | 'kpi-collections'
  | 'kpi-utilities'
  | 'sync-gateway'
  | 'admin-portal'
  | 'bill-cycle'
  | 'payment-new'
  | 'collections'
  | 'project-360';

interface RouterState {
  currentPage: PageKey;
  pageParams: Record<string, string>;
  navigate: (page: PageKey, params?: Record<string, string>) => void;
  goBack: () => void;
}

const history: PageKey[] = [];

export const usePageStore = create<RouterState>((set, get) => ({
  currentPage: 'dashboard',
  pageParams: {},

  navigate: (page: PageKey, params = {}) => {
    const { currentPage } = get();
    history.push(currentPage);
    set({ currentPage: page, pageParams: params });
    window.scrollTo(0, 0);
  },

  goBack: () => {
    const prev = history.pop();
    if (prev) {
      set({ currentPage: prev, pageParams: {} });
    }
  },
}));
