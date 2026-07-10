'use client';

import Link from 'next/link';
import { Navigation } from '../shared/Navigation';
import { Footer } from '../sections/Footer';

type MarketingPageLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  description?: string;
};

export function MarketingPageLayout({ children, title, subtitle, description }: MarketingPageLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation />
      <header className="pt-32 pb-16 px-6 text-center border-b" style={{ borderColor: 'var(--surface-2)', background: 'var(--surface-0)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            {subtitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(90deg, #F58529, #DD2A7B)' }}
            >
              Start free →
            </Link>
            <Link
              href="/"
              className="text-sm font-medium nav-link"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
}
