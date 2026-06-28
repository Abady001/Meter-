'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations, type Locale } from './translations';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
  t: (path: string, params?: Record<string, string | number>) => string;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

function resolveValue(obj: unknown, path: string): string | unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ar');

  const dir = useMemo<'ltr' | 'rtl'>(() => (locale === 'ar' ? 'rtl' : 'ltr'), [locale]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale];
      const raw = resolveValue(dict, path);
      if (typeof raw === 'string') {
        let result = interpolate(raw, params);

        if (params && params.count !== undefined) {
          const count = Number(params.count);
          result = result.replace('{plural}', count !== 1 ? 's' : '');
        } else {
          result = result.replace('{plural}', '');
        }

        return result;
      }
      return path;
    },
    [locale],
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, dir, t, toggleLocale }),
    [locale, dir, t, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT() {
  return useLocale().t;
}
