'use client';

import { SectionContainer } from '../shared/SectionContainer';
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t" style={{ background: 'var(--background)', borderColor: 'var(--surface-3)' }}>
      <SectionContainer padding="lg">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>DMPilot</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Calm DM automation for creators. Built for quiet, on purpose.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Product</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Features</Link></li>
              <li><Link href="/services" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Services</Link></li>
              <li><Link href="/#link-in-bio" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Link in Bio</Link></li>
              <li><Link href="/#roadmap" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/#faq" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>FAQ</Link></li>
              <li><a href="mailto:arwebcrafts@gmail.com" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Support</a></li>
              <li><Link href="/#features" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Integrations</Link></li>
              <li><Link href="/signup" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Get Started</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link></li>
              <li><a href="mailto:arwebcrafts@gmail.com" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--surface-3)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} DMPilot. Built with calm.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>GitHub</a>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
}
