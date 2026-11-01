'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

export type Theme = 'light' | 'dark';

// 保存値がない（または旧仕様の 'system' が保存されている）場合は OS の設定を初期値にする
function getInitialTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch (e) {
    console.warn('Failed to load theme from localStorage:', e);
  }
  if (typeof window.matchMedia !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const initialized = useRef(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined' || !document.documentElement) return;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  const updateTheme = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e);
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    updateTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, updateTheme]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setMounted(true);
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  return {
    theme,
    setTheme: updateTheme,
    toggleTheme,
    mounted,
    effectiveTheme: mounted ? theme : 'light',
  };
}
