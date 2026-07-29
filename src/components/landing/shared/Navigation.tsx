'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { DarkModeToggle } from './DarkModeToggle';

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Services', href: '/services' },
  { name: 'Bio', href: '/#link-in-bio' },
  { name: 'FAQ', href: '/#faq' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className={`nav-glass rounded-full px-4 sm:px-5 h-14 flex items-center gap-3 sm:gap-4 transition-shadow ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="DMPilot Home">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-base sm:text-lg font-bold nav-brand">DMPilot</span>
        </Link>

        <div className="hidden lg:flex items-center justify-center flex-1 gap-5 xl:gap-6" role="menubar">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="nav-link text-sm font-medium whitespace-nowrap"
              role="menuitem"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">
          <DarkModeToggle />
          <CTAButton
            variant="primary"
            size="sm"
            href="/signup"
            aria-label="Join beta"
            className="nav-cta px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:shadow-lg hover:scale-105 whitespace-nowrap"
          >
            Join beta →
          </CTAButton>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden ml-auto p-2 rounded-lg nav-icon-btn transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 nav-glass rounded-2xl p-4"
            role="menu"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="nav-link text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t" style={{ borderColor: 'var(--surface-2)' }}>
                <DarkModeToggle />
                <CTAButton
                  variant="primary"
                  size="sm"
                  href="/signup"
                  className="nav-cta text-white rounded-full"
                  aria-label="Join beta"
                >
                  Join beta →
                </CTAButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
