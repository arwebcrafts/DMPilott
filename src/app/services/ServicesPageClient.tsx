'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MarketingPageLayout } from '@/components/landing/pages/MarketingPageLayout';
import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SERVICES, AUDIENCE_USE_CASES } from '@/lib/landing/content';

export function ServicesPageClient() {
  return (
    <MarketingPageLayout
      title="Services built for Instagram growth"
      subtitle="Services"
      description="Four core services that work together: capture comments, reply in DMs, showcase your links, and measure results."
    >
      <SectionContainer padding="lg">
        <div className="space-y-8 max-w-4xl mx-auto">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border p-8 md:p-10"
                style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B)' }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                      {service.tagline}
                    </p>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                      {service.title}
                    </h2>
                    <p className="leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      {service.description}
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-2 mb-4">
                      {service.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="text-sm flex items-center gap-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DD2A7B] flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Best for: {service.forWhom}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </SectionContainer>

      <SectionContainer padding="lg" className="section-cool border-t border-[color:var(--surface-2)]">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>
          Who uses DMPilot
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {AUDIENCE_USE_CASES.map((audience) => {
            const Icon = audience.icon;
            return (
              <div
                key={audience.title}
                className="rounded-2xl border p-5"
                style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
              >
                <Icon className="w-6 h-6 text-[#DD2A7B] mb-3" />
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {audience.title}
                </h3>
                <ul className="space-y-1.5">
                  {audience.examples.map((ex) => (
                    <li key={ex} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      · {ex}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionContainer>

      <SectionContainer padding="lg" className="section-warm">
        <div className="max-w-xl mx-auto text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            See all features <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionContainer>
    </MarketingPageLayout>
  );
}
