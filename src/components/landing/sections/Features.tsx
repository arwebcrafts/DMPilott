'use client';

import { motion } from 'framer-motion';
import { ToggleRight } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { LIVE_FEATURES } from '@/lib/landing/content';
import Link from 'next/link';

export function Features() {
  return (
    <SectionContainer padding="lg" id="features" className="section-neutral">
      <SectionHeader
        title="Everything you need to turn comments into customers"
        subtitle="Live today"
        description="No fake AI promises. These are the features shipping in DMPilot right now."
        align="center"
        size="lg"
      />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {LIVE_FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-2xl border p-6 hover:shadow-lg transition-all duration-300"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B)' }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          href="/features"
          className="text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          View full feature list →
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="flex items-center gap-2">
          <ToggleRight className="w-4 h-4 text-emerald-500" /> Official Meta APIs
        </span>
        <span className="flex items-center gap-2">
          <ToggleRight className="w-4 h-4 text-emerald-500" /> Instagram + Facebook
        </span>
        <span className="flex items-center gap-2">
          <ToggleRight className="w-4 h-4 text-emerald-500" /> Posts & Reels
        </span>
      </motion.div>
    </SectionContainer>
  );
}
