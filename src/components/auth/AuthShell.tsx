'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
      )}
    </button>
  );
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="auth-card rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
                <span className="text-white text-lg font-bold">D</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>DMPilot</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              <DarkModeToggle />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          </div>

          {children}

          {footer}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
