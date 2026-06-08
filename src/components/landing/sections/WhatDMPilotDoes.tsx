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
    <SectionContainer padding="xl" id="what-dmpilot-does" className="bg-gray-50">
      <SectionHeader
        title="What DMPilot Does"
        subtitle="Quiet, on purpose."
        description="Four pillars holding up the calm. Each one solves a piece of the manual chaos."
        align="center"
        size="lg"
      />
      <div className="mt-16 max-w-4xl mx-auto">
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-8 items-start mb-12 last:mb-0"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {pillar.number}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-gray-600">{pillar.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-600">Four columns under one roof.</p>
        <p className="text-gray-500">Quiet, on purpose.</p>
      </div>
    </SectionContainer>
  );
}
