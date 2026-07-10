'use client';

import { motion } from 'framer-motion';
import { Sparkles, Gift, Inbox, Bot, Layers, Zap } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

const upcoming = [
  {
    icon: Gift,
    title: 'Comment-to-Enter Giveaways',
    description: 'Run giveaways where followers comment a keyword to enter. Pick winners automatically and DM them.',
    eta: 'Q3 2026',
  },
  {
    icon: Bot,
    title: 'AI Response Suggestions',
    description: 'Smart reply templates that match your tone. Review before sending, always in control.',
    eta: 'Q3 2026',
  },
  {
    icon: Inbox,
    title: 'Unified Inbox',
    description: 'All Instagram and Facebook DMs in one calm inbox. No more switching between apps.',
    eta: 'Q4 2026',
  },
  {
    icon: Layers,
    title: 'Story & Reel Triggers',
    description: 'Automate DMs when someone replies to your story or mentions you.',
    eta: 'Q4 2026',
  },
  {
    icon: Zap,
    title: 'Zapier & API Access',
    description: 'Connect DMPilot to your CRM, email tool, or custom workflows via API.',
    eta: 'Q4 2026',
  },
  {
    icon: Sparkles,
    title: 'Custom Domains for Bio',
    description: 'Use links.yourbrand.com instead of a generic URL. Full white-label link pages.',
    eta: '2027',
  },
];

export function Roadmap() {
  return (
    <SectionContainer padding="lg" id="roadmap" className="section-warm">
      <SectionHeader
        title="What we are building next"
        subtitle="Roadmap"
        description="Transparent about what is live and what is coming. No vaporware in the Live section above."
        align="center"
        size="lg"
      />

      <div className="mt-14 max-w-4xl mx-auto">
        <div className="relative">
          <div
            className="absolute left-6 top-0 bottom-0 w-px hidden sm:block"
            style={{ background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
          />

          <div className="space-y-6">
            {upcoming.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="relative flex gap-5 sm:pl-14"
                >
                  <div
                    className="hidden sm:flex absolute left-3 w-6 h-6 rounded-full items-center justify-center z-10"
                    style={{ background: 'var(--accent)' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  <div
                    className="flex-1 rounded-2xl border p-5 sm:p-6"
                    style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        {item.eta}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed pl-0 sm:pl-[52px]" style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
