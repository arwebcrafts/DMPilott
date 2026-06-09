'use client';

import { SectionContainer } from '../shared/SectionContainer';

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
              <li><a href="#features" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Features</a></li>
              <li><a href="#integrations" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Integrations</a></li>
              <li><a href="#pricing" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Pricing</a></li>
              <li><a href="#changelog" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Changelog</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resources</h4>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Documentation</a></li>
              <li><a href="/blog" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Blog</a></li>
              <li><a href="/support" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Support</a></li>
              <li><a href="/api" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>API</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy</a></li>
              <li><a href="/terms" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms</a></li>
              <li><a href="/security" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Security</a></li>
              <li><a href="/gdpr" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--surface-3)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} DMPilot. Built with calm.
          </p>
          <div className="flex items-center gap-4">
            <a href="/twitter" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Twitter</a>
            <a href="/instagram" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
            <a href="/github" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>GitHub</a>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
}
