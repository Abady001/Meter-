'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('meter-verse-theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else if (enableSystem) {
      setTheme(getSystemTheme());
    }
  }, [enableSystem]);

  React.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    let resolvedTheme: 'dark' | 'light';

    if (theme === 'system') {
      resolvedTheme = getSystemTheme();
    } else {
      resolvedTheme = theme;
    }

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
  }, [theme, attribute, mounted]);

  const value = React.useMemo(() => ({
    theme,
    setTheme: (t: Theme) => {
      setTheme(t);
      localStorage.setItem('meter-verse-theme', t);
    },
    resolvedTheme: theme === 'system' ? getSystemTheme() : theme,
  }), [theme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

import { createContext, useContext } from 'react';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
});

export function useTheme() {
  return useContext(ThemeContext);
}
