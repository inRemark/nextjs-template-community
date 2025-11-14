"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { cn } from "@shared/utils";
import { Theme, ThemeContext } from "./theme.types";

const THEME_KEY = 'theme';

function getSystemTheme(): 'light' | 'dark' {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage after hydration
  useEffect(() => {
    // Use the pre-set theme preference from the inline script
    const preSetTheme = (globalThis as any).__THEME_PREFERENCE__;
    if (preSetTheme) {
      setTheme(preSetTheme.theme);
      setSystemTheme(getSystemTheme());
      setIsInitialized(true);
      // Clean up the global variable
      delete (globalThis as any).__THEME_PREFERENCE__;
    } else {
      // Fallback to normal initialization
      const savedTheme = localStorage.getItem(THEME_KEY);
      const currentTheme = (savedTheme as Theme) || 'system';
      setTheme(currentTheme);
      
      const currentSystemTheme = getSystemTheme();
      setSystemTheme(currentSystemTheme);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setThemeWithPersist = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);

    const root = globalThis.document.documentElement;
    if (newTheme === 'system') {
      const isSystemDark = getSystemTheme() === 'dark';
      root.classList.toggle('dark', isSystemDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }

    root.classList.add('theme-transition');
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setThemeWithPersist(currentTheme === 'dark' ? 'light' : 'dark');
  }, [theme, systemTheme, setThemeWithPersist]);

  // Only apply theme changes after initialization to prevent flashing
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const root = globalThis.document.documentElement;
    const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
    
    // Only update if the class actually needs to change
    const hasDarkClass = root.classList.contains('dark');
    if (hasDarkClass !== isDark) {
      root.classList.toggle('dark', isDark);
    }
  }, [theme, systemTheme, isInitialized]);

  const isDarkMode = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const rootClassName = useMemo(
    () => {
      let bgClass: string;
      if (!isInitialized) {
        bgClass = "bg-background";
      } else if (isDarkMode) {
        bgClass = "bg-gray-900";
      } else {
        bgClass = "bg-gray-50";
      }
      
      return cn(
        "h-screen w-screen flex flex-col overflow-hidden",
        bgClass
      );
    },
    [isDarkMode, isInitialized]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeWithPersist,
      isDarkMode,
      toggleDarkMode,
      rootClassName,
    }),
    [theme, isDarkMode, rootClassName, setThemeWithPersist, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 