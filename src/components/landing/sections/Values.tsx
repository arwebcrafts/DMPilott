'use client';

import { motion } from 'framer-motion';
import { Shield, Heart, Zap, Users } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function Values() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Authenticity First',
      description: 'We believe in preserving the human connection. Our AI is designed to enhance, not replace, your authentic voice.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and never shared. We use official Instagram APIs and comply with all data protection regulations.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Radical Transparency',
      description: 'We\'re upfront about what our AI can and cannot do. No hidden fees, no surprise limitations, complete clarity.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Creator-Centric',
      description: 'Built by creators, for creators. We understand your challenges because we face them too.',
    },
  ];

  return (
    <SectionContainer padding="xl" id="values">
      <SectionHeader
        title="Our Values"
        subtitle="What we believe in"
        description="DMPilot is built on a foundation of trust, authenticity, and creator empowerment. These values guide everything we do."
        align="center"
        size="lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {values.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-xl p-8 text-center"
          >
            <div className="text-blue-600 mb-4 flex justify-center">{value.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {value.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {value.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Transparency Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 max-w-3xl mx-auto"
      >
        <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Our Commitment to You
          </h3>
          <p className="text-gray-700 leading-relaxed">
            We promise to always be transparent about our capabilities, protect your data with the highest security standards, and continuously improve based on your feedback. DMPilot is a tool to help you succeed, not a replacement for your authentic voice.
          </p>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
