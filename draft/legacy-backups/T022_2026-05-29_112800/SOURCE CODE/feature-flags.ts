import { useState, useCallback } from 'react';

export type FeatureFlag = 'mock' | 'api';

export const FeatureFlags: Record<string, FeatureFlag> = {
  'projects.list': 'mock',
  'projects.readings': 'mock',
  'locations.list': 'mock',
  'customers.list': 'mock',
  'meters.list': 'mock',
  'sims.list': 'mock',
  'readings.list': 'mock',
  'billing.list': 'mock',
  'invoices.list': 'mock',
  'payments.list': 'mock',
  'reports.list': 'mock',
  'alerts.list': 'mock',
  'tickets.list': 'mock',
};

const STORAGE_KEY = 'meter-feature-flags';

const autoOverrides: Record<string, string[]> = {
  'projects.readings': ['projects.list'],
};

function loadFlags(): Record<string, FeatureFlag> {
  if (typeof window === 'undefined') return { ...FeatureFlags };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...FeatureFlags, ...parsed };
    }
  } catch { }
  return { ...FeatureFlags };
}

function persistFlags(flags: Record<string, FeatureFlag>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

export function isFeatureEnabled(feature: string): boolean {
  const flags = loadFlags();
  return flags[feature] === 'api';
}

export function useFeatureFlag(feature: string) {
  const [flag, setFlag] = useState<FeatureFlag>(() => {
    const flags = loadFlags();
    return flags[feature] ?? 'mock';
  });

  const set = useCallback(
    (value: FeatureFlag) => {
      const flags = loadFlags();
      flags[feature] = value;
      if (autoOverrides[feature]) {
        for (const dep of autoOverrides[feature]) {
          flags[dep] = value;
        }
      }
      persistFlags(flags);
      setFlag(value);
    },
    [feature],
  );

  return [flag, set] as const;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>(loadFlags);

  const set = useCallback((key: string, value: FeatureFlag) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      if (autoOverrides[key]) {
        for (const dep of autoOverrides[key]) {
          next[dep] = value;
        }
      }
      persistFlags(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    persistFlags({ ...FeatureFlags });
    setFlags({ ...FeatureFlags });
  }, []);

  return { flags, setFlag: set, reset };
}
