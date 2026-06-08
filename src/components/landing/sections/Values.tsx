'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';

const commitments = [
  'Let you own everything. Export anytime. Delete anytime. We never sell your data, never read DMs for ads, never train AI on you without consent.',
  'Stay free at the core. When we open up, the basics stay free. There will be a Pro tier later for power features. Core is yours.',
  'Choose calm over clever. We\'d rather be quiet than viral. We\'d rather you finish your day than open the app twelve times.',
  'Build for creators, by creators. We understand your challenges because we face them too. Built by creators, for creators.',
  'Radical transparency. We\'re upfront about what our AI can and cannot do. No hidden fees, no surprise limitations, complete clarity.',
];

export function Values() {
  return (
    <SectionContainer padding="xl" id="values" className="section-warm">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-warm p-8 md:p-12"
        >
          {/* Document styling */}
          <div className="border-b-2 pb-4 mb-6" style={{ borderColor: 'var(--surface-3)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-display)' }}>Five Commitments</h2>
            <p className="text-sm uppercase tracking-widest text-gray-600 dark:text-gray-300">THE MANIFESTO</p>
          </div>

          <div className="space-y-6">
            {commitments.map((commitment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>
                  {index + 1}
                </div>
                <p className="text-base leading-relaxed flex-1 pt-1 text-gray-600 dark:text-gray-300">
                  {commitment}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--surface-3)' }}>
            <p className="text-sm italic text-gray-600 dark:text-gray-300">
              These aren't marketing claims. They're the foundation of how we build DMPilot.
            </p>
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
