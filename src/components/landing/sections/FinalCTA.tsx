'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SectionContainer } from '../shared/SectionContainer';

export function FinalCTA() {
  return (
    <SectionContainer padding="lg" id="join" className="section-warm">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            Ready to automate?
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Stop losing customers in your comment section
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Connect Instagram, set one automation, and start sending DMs today. Free plan includes 300 DMs per month and your Link in Bio page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full font-semibold text-white text-base shadow-lg hover:scale-[1.02] transition-all"
              style={{ background: 'linear-gradient(90deg, #F58529, #DD2A7B)' }}
            >
              Create free account →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-full font-semibold text-base border transition-colors"
              style={{ borderColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
            >
              Log in
            </Link>
          </div>

          <p className="text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Official Meta APIs · Instagram + Facebook · No credit card
          </p>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
