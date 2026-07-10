'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';

const pillars = [
  {
    number: '01',
    title: 'Comments become DMs',
    description: 'Someone comments on your post or reel. DMPilot sends them a personalized DM automatically. Keyword or every comment.',
  },
  {
    number: '02',
    title: 'You write the message',
    description: 'Use your own templates with {name} and {username}. No mystery AI rewriting your voice. You stay in control.',
  },
  {
    number: '03',
    title: 'Public replies too',
    description: 'Optionally post "Check your DMs!" under the comment. Keeps your post engagement visible while you convert in private.',
  },
  {
    number: '04',
    title: 'Link in Bio included',
    description: 'A full Linktree-style page built into DMPilot. Links, videos, products, themes, and click analytics.',
  },
];

export function WhatDMPilotDoes() {
  return (
    <SectionContainer padding="lg" id="what-dmpilot-does" className="section-cool">
      <SectionHeader
        title="How DMPilot works"
        subtitle="Simple, honest, effective"
        description="Four things DMPilot does today. No inbox chaos, no fake integrations."
        align="center"
        size="lg"
      />
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border p-6 flex items-start gap-5"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 text-white rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B)' }}
              >
                {pillar.number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{pillar.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
