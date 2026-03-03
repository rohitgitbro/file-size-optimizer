
'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, PaletteMode, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme/theme';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

export const useColorMode = () => useContext(ColorModeContext);

interface AppThemeProviderProps {
  children: React.ReactNode;
  initialMode: PaletteMode;
}

export function AppThemeProvider({ children, initialMode }: AppThemeProviderProps) {
  // Use the mode provided by the server (via cookie) or fallback to 'light'
  const [mode, setMode] = useState<PaletteMode>(initialMode);

  // Sync mode with localStorage and a cookie so the server knows it on next request
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          
          // 1. Sync LocalStorage for client-side persistence
          localStorage.setItem('themeMode', next);
          
          // 2. Sync Cookie so Server-Side Rendering (SSR) knows the theme
          // This prevents hydration mismatches because server and client will match
          document.cookie = `theme-mode=${next}; path=/; max-age=31536000; SameSite=Lax`;
          
          // 3. Update DOM attribute for any existing CSS logic
          document.documentElement.setAttribute('data-theme', next);
          
          return next;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () => (mode === 'dark' ? darkTheme : lightTheme),
    [mode]
  );

  // Fallback for case where cookie isn't set yet but user has a preference in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as PaletteMode;
    if (saved && saved !== initialMode) {
      // Use requestAnimationFrame to avoid "cascading renders" lint error
      requestAnimationFrame(() => {
        setMode(saved);
        document.cookie = `theme-mode=${saved}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.setAttribute('data-theme', saved);
      });
    }
  }, [initialMode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
