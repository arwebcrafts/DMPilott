'use client';

import { motion } from 'framer-motion';
import { Users, ShoppingBag, GraduationCap, Briefcase } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function TargetAudience() {
  const audiences = [
    {
      icon: <ShoppingBag className="h-8 w-8" />,
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
      icon: <GraduationCap className="h-8 w-8" />,
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
      icon: <Briefcase className="h-8 w-8" />,
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
      icon: <Users className="h-8 w-8" />,
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
    <SectionContainer variant="light" padding="xl" id="audience">
      <SectionHeader
        title="Who Is DMPilot For?"
        subtitle="Built for creators who want to scale their DM engagement"
        description="Whether you're selling products, courses, or services, DMPilot helps you turn Instagram comments into customers."
        align="center"
        size="lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {audiences.map((audience, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-blue-600 flex-shrink-0">{audience.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {audience.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {audience.description}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Use Cases:</p>
              <ul className="space-y-1">
                {audience.useCases.map((useCase, i) => (
                  <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-lg text-gray-600 mb-4">
          Not sure if DMPilot is right for you?
        </p>
        <p className="text-gray-500">
          Start with our 14-day free trial. No credit card required.
        </p>
      </motion.div>
    </SectionContainer>
  );
}
