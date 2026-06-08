'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function Comparison() {
  const features = [
    { name: 'Instant Response Time', dmpilot: true, manual: false },
    { name: '24/7 Availability', dmpilot: true, manual: false },
    { name: 'Consistent Messaging', dmpilot: true, manual: false },
    { name: 'Scalable to Growth', dmpilot: true, manual: false },
    { name: 'Analytics & Insights', dmpilot: true, manual: false },
    { name: 'Custom Workflows', dmpilot: true, manual: false },
    { name: 'Personal Touch', dmpilot: true, manual: true },
    { name: 'Full Control', dmpilot: true, manual: true },
  ];

  return (
    <SectionContainer variant="light" padding="xl" id="comparison" className="section-neutral">
      <SectionHeader
        title="DMPilot vs Manual Responses"
        subtitle="See the difference automation makes"
        description="Compare DMPilot's automated DM management with manual responses. The choice is clear."
        align="center"
        size="lg"
      />

      {/* Quadrant Chart Layout */}
      <div className="mt-12 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* DMPilot Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-warm p-6"
          >
            <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: 'var(--accent)' }}>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>DMPilot</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Automated & Controlled</p>
            </div>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.dmpilot ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#e5e7eb' }}>
                      <X className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{feature.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Manual Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card-warm p-6"
          >
            <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: 'var(--surface-3)' }}>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Manual</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Time-Intensive & Inconsistent</p>
            </div>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.manual ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#e5e7eb' }}>
                      <X className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{feature.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 max-w-2xl mx-auto text-center p-6 rounded-xl"
        style={{ background: 'var(--surface-1)' }}
      >
        <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
          DMPilot gives you the best of both worlds: the speed and scale of automation with the personal touch of manual responses.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          You maintain full control over your messaging while saving hours every day.
        </p>
      </motion.div>
    </SectionContainer>
  );
}
