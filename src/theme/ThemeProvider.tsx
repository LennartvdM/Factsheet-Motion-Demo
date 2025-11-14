import React, { createContext, useContext, useMemo } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = 'dark';
  }

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: 'dark',
      setTheme: () => {}
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
