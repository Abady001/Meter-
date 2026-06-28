'use client';

import React, { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/context';

function HtmlLocaleUpdater({ children }: { children: React.ReactNode }) {
  const { locale, dir } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return <>{children}</>;
}

export function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <HtmlLocaleUpdater>{children}</HtmlLocaleUpdater>
    </LocaleProvider>
  );
}
