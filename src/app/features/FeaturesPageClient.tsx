'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { MarketingPageLayout } from '@/components/landing/pages/MarketingPageLayout';
import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { LIVE_FEATURES } from '@/lib/landing/content';

export function FeaturesPageClient() {
  return (
    <MarketingPageLayout
      title="All features, live today"
      subtitle="Features"
      description="No vaporware. Every item below is shipping in DMPilot right now."
    >
      <SectionContainer padding="lg">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {LIVE_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border p-6"
                style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {feature.badge}
                  </span>
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h2>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </SectionContainer>

      <SectionContainer padding="lg" className="section-warm border-t border-[color:var(--surface-2)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Want to see what is coming next?
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Giveaways, AI suggestions, unified inbox, and more are on the roadmap.
          </p>
          <Link
            href="/#roadmap"
            className="inline-flex px-6 py-3 rounded-full font-semibold text-sm border transition-colors"
            style={{ borderColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
          >
            View roadmap
          </Link>
        </div>
      </SectionContainer>
    </MarketingPageLayout>
  );
}
