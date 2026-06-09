'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { DarkModeToggle } from './DarkModeToggle';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-3xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="nav-glass rounded-full px-6 h-14 flex items-center gap-8">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2"
          aria-label="DMPilot Home"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>DMPilot</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 flex-1" role="menubar">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              role="menuitem"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <CTAButton
            variant="primary"
            size="sm"
            href="/signup"
            aria-label="Join beta"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:shadow-lg hover:scale-105"
          >
            Join beta →
          </CTAButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: 'var(--foreground)' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 nav-glass rounded-2xl p-4"
            role="menu"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <CTAButton
                variant="primary"
                size="md"
                href="/signup"
                className="w-full"
                aria-label="Join beta"
              >
                Join beta →
              </CTAButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
