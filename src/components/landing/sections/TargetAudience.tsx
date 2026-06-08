'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function TargetAudience() {
  const segments = [
    {
      title: 'E-commerce Sellers',
      description: 'Turn product inquiries into sales. Automatically respond to questions about sizing, availability, and shipping.',
      useCases: [
        'Product availability questions',
        'Shipping and delivery inquiries',
        'Size and fit questions',
        'Custom order requests',
      ],
    },
    {
      title: 'Course Creators',
      description: 'Convert interested followers into students. Respond to course inquiries and provide enrollment information instantly.',
      useCases: [
        'Course curriculum questions',
        'Pricing and discount inquiries',
        'Enrollment assistance',
        'Student support queries',
      ],
    },
    {
      title: 'Service Providers',
      description: 'Book more clients by responding to service inquiries quickly. Qualify leads and schedule consultations automatically.',
      useCases: [
        'Service package inquiries',
        'Availability and booking',
        'Pricing quote requests',
        'Consultation scheduling',
      ],
    },
    {
      title: 'Influencers & Creators',
      description: 'Engage with your audience at scale. Respond to fan messages, partnership inquiries, and brand collaboration requests.',
      useCases: [
        'Fan engagement and DMs',
        'Partnership inquiries',
        'Brand collaboration requests',
        'Content feedback and questions',
      ],
    },
  ];

  return (
    <SectionContainer padding="xl" id="audience" className="bg-gray-50">
      <SectionHeader
        title="Built for You, If..."
        subtitle="You're one of these"
        description="Four types of creators who benefit from calm DM automation."
        align="center"
        size="lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {segment.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {segment.description}
            </p>
            <ul className="space-y-2">
              {segment.useCases.map((useCase, i) => (
                <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                  <span className="text-gray-900 mt-1">—</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
