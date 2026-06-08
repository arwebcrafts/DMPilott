'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { IntegrationCard } from '../shared/IntegrationCard';

export function Integrations() {
  const integrations = [
    {
      name: 'Instagram',
      logo: '/images/integrations/instagram.png',
      category: 'Social Media',
      description: 'Official Instagram API integration',
    },
    {
      name: 'Shopify',
      logo: '/images/integrations/shopify.png',
      category: 'E-commerce',
      description: 'Sync products and orders',
    },
    {
      name: 'Stripe',
      logo: '/images/integrations/stripe.png',
      category: 'Payments',
      description: 'Process payments seamlessly',
    },
    {
      name: 'Gmail',
      logo: '/images/integrations/gmail.png',
      category: 'Email',
      description: 'Email notifications',
    },
    {
      name: 'Slack',
      logo: '/images/integrations/slack.png',
      category: 'Communication',
      description: 'Team notifications',
    },
    {
      name: 'Zapier',
      logo: '/images/integrations/zapier.png',
      category: 'Automation',
      description: 'Connect 5000+ apps',
    },
  ];

  return (
    <SectionContainer padding="xl" id="integrations">
      <SectionHeader
        title="Works with Your Favorite Tools"
        subtitle="Seamless integrations for your workflow"
        description="DMPilot integrates with the tools you already use, so you can automate your DMs without disrupting your existing workflow."
        align="center"
        size="lg"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {integrations.map((integration, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <IntegrationCard {...integration} />
          </motion.div>
        ))}
      </div>

      {/* More Integrations CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600 mb-2">
          Need a specific integration?
        </p>
        <p className="text-sm text-gray-500">
          We're constantly adding new integrations. Let us know what you need.
        </p>
      </motion.div>
    </SectionContainer>
  );
}
