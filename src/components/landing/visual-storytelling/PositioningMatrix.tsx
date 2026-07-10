'use client';

import { motion } from 'framer-motion';

interface Competitor {
  name: string;
  x: number;
  y: number;
  isDMPilot?: boolean;
}

const competitors: Competitor[] = [
  { name: 'ManyChat', x: 30, y: 70 },
  { name: 'Buffer', x: 80, y: 60 },
  { name: 'Hootsuite', x: 40, y: 30 },
  { name: 'DMPilot', x: 20, y: 20, isDMPilot: true },
];

const competitorNotes: Record<string, string> = {
  ManyChat: 'Great chatbot platform. We just added Instagram DM focus and personal touch.',
  Buffer: 'Powerful social media management. DMPilot is opinionated about DMs. Fewer features, more conversions.',
  Hootsuite: 'Enterprise social suite. DMPilot is focused on creator DMs. Simpler, more effective.',
};

export function PositioningMatrix() {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="relative aspect-square rounded-2xl p-8 border"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
      >
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          CALM ↓
        </div>

        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          SINGLE-PURPOSE ← EVERYTHING IN ONE →
        </div>

        <div className="absolute top-4 right-4 text-xs" style={{ color: 'var(--text-muted)' }}>BUSY · MAXIMAL</div>
        <div className="absolute top-4 left-4 text-xs" style={{ color: 'var(--text-muted)' }}>BUSY · NICHE</div>
        <div className="absolute bottom-4 right-4 text-xs" style={{ color: 'var(--text-muted)' }}>CALM · COMPLETE</div>
        <div className="absolute bottom-4 left-4 text-xs" style={{ color: 'var(--text-muted)' }}>CALM · NICHE ★</div>

        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.name}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{
              left: `${competitor.x}%`,
              top: `${competitor.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={
                competitor.isDMPilot
                  ? { background: 'linear-gradient(90deg, #F58529, #DD2A7B)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)' }
              }
            >
              {competitor.name}
            </div>
            {competitor.isDMPilot && (
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}
              >
                ← here
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {competitors.filter((c) => !c.isDMPilot).map((competitor) => (
          <div
            key={competitor.name}
            className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 rounded-xl p-4 border"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
          >
            <span className="font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
              {competitor.name}.
            </span>
            <span className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {competitorNotes[competitor.name]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
