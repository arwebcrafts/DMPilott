'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

const connections = [
  { from: 'Instagram', to: 'DMPilot', type: 'official' },
  { from: 'Facebook', to: 'DMPilot', type: 'official' },
  { from: 'Gmail', to: 'DMPilot', type: 'api' },
  { from: 'Shopify', to: 'DMPilot', type: 'api' },
  { from: 'Stripe', to: 'DMPilot', type: 'api' },
  { from: 'Slack', to: 'DMPilot', type: 'webhook' },
  { from: 'Zapier', to: 'DMPilot', type: 'api' },
];

const typeColors: Record<string, string> = {
  official: '#e85d3a',
  api: '#3b82f6',
  webhook: '#22c55e',
};

export function Integrations() {
  return (
    <SectionContainer padding="xl" id="integrations">
      <SectionHeader
        title="Works with Your Favorite Tools"
        subtitle="Seamless integrations for your workflow"
        description="DMPilot integrates with the tools you already use, so you can automate your DMs without disrupting your existing workflow."
        align="center"
        size="lg"
      />

      <div className="mt-16 max-w-4xl mx-auto">
        {/* Transit Map Visual */}
        <div className="relative p-8 rounded-2xl min-h-[320px] sm:min-h-[360px] md:min-h-[400px]" style={{ background: 'var(--surface-1)' }}>
          {/* Central Hub - DMPilot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-xl" style={{ background: 'var(--accent)' }}>
              DMPilot
            </div>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 1 }}>
            {connections.map((conn, i) => {
              const angle = (i * (360 / connections.length)) - 90;
              const radius = 160;
              const centerX = 50;
              const centerY = 50;
              const x1 = centerX + (radius / 2) * Math.cos(angle * Math.PI / 180);
              const y1 = centerY + (radius / 2) * Math.sin(angle * Math.PI / 180);
              const x2 = centerX + radius * Math.cos(angle * Math.PI / 180);
              const y2 = centerY + radius * Math.sin(angle * Math.PI / 180);
              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={typeColors[conn.type]}
                  strokeWidth="3"
                  strokeDasharray={conn.type === 'webhook' ? '8 4' : '0'}
                />
              );
            })}
          </svg>

          {/* Integration Nodes - radial on desktop, grid on mobile */}
          <div className="md:hidden grid grid-cols-3 sm:grid-cols-4 gap-4 pt-24 pb-4">
            {connections.map((conn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ background: typeColors[conn.type] }}>
                  {conn.from.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {conn.from}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Desktop radial layout */}
          {connections.map((conn, i) => {
            const angle = (i * (360 / connections.length)) - 90;
            const radius = 160;
            const centerX = 50;
            const centerY = 50;
            const x = centerX + radius * Math.cos(angle * Math.PI / 180);
            const y = centerY + radius * Math.sin(angle * Math.PI / 180);

            return (
              <motion.div
                key={`desktop-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="absolute hidden md:block"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', zIndex: 5 }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ background: typeColors[conn.type] }}>
                  {conn.from.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {conn.from}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: typeColors.official }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Official API</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: typeColors.api }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-dashed" style={{ background: typeColors.webhook }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Webhook</span>
          </div>
        </div>
      </div>

      {/* More Integrations CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          Need a specific integration?
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          We're constantly adding new integrations. Let us know what you need.
        </p>
      </motion.div>
    </SectionContainer>
  );
}
