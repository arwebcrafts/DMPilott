'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'dmpilot-theme';

export function getStoredTheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="nav-icon-btn p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      aria-label="Toggle dark mode"
      style={{ color: 'var(--foreground)' }}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
