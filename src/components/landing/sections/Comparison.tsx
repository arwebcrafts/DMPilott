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
    <SectionContainer variant="light" padding="xl" id="comparison">
      <SectionHeader
        title="DMPilot vs Manual Responses"
        subtitle="See the difference automation makes"
        description="Compare DMPilot's automated DM management with manual responses. The choice is clear."
        align="center"
        size="lg"
      />

      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-gray-600 font-medium">Feature</th>
              <th className="text-center py-4 px-6 text-gray-900 font-bold text-lg bg-blue-50 rounded-t-lg">
                DMPilot
              </th>
              <th className="text-center py-4 px-6 text-gray-600 font-medium">Manual</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-gray-700">{feature.name}</td>
                <td className="py-4 px-6 text-center">
                  {feature.dmpilot ? (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      <X className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {feature.manual ? (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      <X className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 max-w-2xl mx-auto text-center"
      >
        <p className="text-lg text-gray-600 mb-4">
          DMPilot gives you the best of both worlds: the speed and scale of automation with the personal touch of manual responses.
        </p>
        <p className="text-gray-500">
          You maintain full control over your messaging while saving hours every day.
        </p>
      </motion.div>
    </SectionContainer>
  );
}
