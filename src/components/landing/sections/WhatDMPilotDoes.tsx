'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';

const pillars = [
  {
    number: 'I',
    title: 'DMs that don\'t slip.',
    description: 'Capture from comments, stories, reels. One calm inbox.',
  },
  {
    number: 'II',
    title: 'AI that protects.',
    description: 'Smart responses with full approval workflow. You stay in control.',
  },
  {
    number: 'III',
    title: 'Conversions that stay in view.',
    description: 'Track every conversation. Today feeds tomorrow\'s insights.',
  },
  {
    number: 'IV',
    title: 'Calm by default.',
    description: 'No spamming. No automation without consent. A quieter DM strategy, by design.',
  },
];

export function WhatDMPilotDoes() {
  return (
    <SectionContainer padding="xl" id="what-dmpilot-does" className="section-cool">
      <SectionHeader
        title="What DMPilot Does"
        subtitle="Quiet, on purpose."
        description="Four pillars holding up the calm. Each one solves a piece of the manual chaos."
        align="center"
        size="lg"
      />
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-warm flex items-start gap-5"
            >
              <div className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--accent)' }}>
                {pillar.number}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{pillar.title}</h3>
                <p className="text-base text-gray-600 dark:text-gray-300">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Four columns under one roof.</p>
        <p className="text-gray-600 dark:text-gray-300">Quiet, on purpose.</p>
      </div>
    </SectionContainer>
  );
}
