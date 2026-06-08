'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function Values() {
  const commitments = [
    {
      number: '01',
      title: 'Let you own everything.',
      description: 'Export anytime. Delete anytime. We never sell your data, never read DMs for ads, never train AI on you without consent.',
    },
    {
      number: '02',
      title: 'Stay free at the core.',
      description: 'When we open up, the basics stay free. There will be a Pro tier later for power features. Core is yours.',
    },
    {
      number: '03',
      title: 'Choose calm over clever.',
      description: 'We\'d rather be quiet than viral. We\'d rather you finish your day than open the app twelve times.',
    },
    {
      number: '04',
      title: 'Build for creators, by creators.',
      description: 'We understand your challenges because we face them too. Built by creators, for creators.',
    },
    {
      number: '05',
      title: 'Radical transparency.',
      description: 'We\'re upfront about what our AI can and cannot do. No hidden fees, no surprise limitations, complete clarity.',
    },
  ];

  return (
    <SectionContainer padding="xl" id="values" className="bg-gray-50">
      <SectionHeader
        title="Five Commitments"
        subtitle="What we promise"
        description="These aren't marketing claims. They're the foundation of how we build DMPilot."
        align="center"
        size="lg"
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {commitments.map((commitment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-6 items-start"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {commitment.number}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{commitment.title}</h3>
              <p className="text-gray-600">{commitment.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
