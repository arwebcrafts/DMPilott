'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IntegrationData {
  name: string;
  category: string;
  icon: string;
}

interface IntegrationMapProps {
  integrations: IntegrationData[];
  className?: string;
}

export function IntegrationMap({ integrations, className }: IntegrationMapProps) {
  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {categories.map((category) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="space-y-3">
            {integrations
              .filter(i => i.category === category)
              .map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                >
                  <img
                    src={integration.icon}
                    alt={integration.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {integration.name}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
