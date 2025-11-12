import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { withViewTransition } from '@/lib/viewTransition';

type Theme = 'default' | 'ocean' | 'sunset' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {}
});

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'default';
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'default';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = getSystemTheme();
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = initial;
    }
    return initial;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (event: MediaQueryListEvent) => {
        setThemeState((current) => {
          if (current === 'default' || current === 'dark') {
            return event.matches ? 'dark' : 'default';
          }

          return current;
        });
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }

      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme: (nextTheme: Theme) => {
        withViewTransition(() => {
          setThemeState(nextTheme);
        });
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
