'use client';

import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from './ThemeIcons';

export default function ThemeSelector() {
  const { toggleTheme, mounted, effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <div className="theme-selector">
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        type="button"
        aria-label={isDark ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'}
        suppressHydrationWarning
      >
        {!mounted ? <SunIcon /> : isDark ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
