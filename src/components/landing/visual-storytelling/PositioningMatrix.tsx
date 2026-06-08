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

export function PositioningMatrix() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative aspect-square bg-gray-50 rounded-2xl p-8 border border-gray-200">
        {/* Y-axis label */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
          CALM ↓
        </div>
        
        {/* X-axis label */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600">
          SINGLE-PURPOSE ← EVERYTHING IN ONE →
        </div>
        
        {/* Quadrant labels */}
        <div className="absolute top-4 right-4 text-xs text-gray-400">BUSY · MAXIMAL</div>
        <div className="absolute top-4 left-4 text-xs text-gray-400">BUSY · NICHE</div>
        <div className="absolute bottom-4 right-4 text-xs text-gray-400">CALM · COMPLETE</div>
        <div className="absolute bottom-4 left-4 text-xs text-gray-400">CALM · NICHE ★</div>
        
        {/* Competitor points */}
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
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                competitor.isDMPilot
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {competitor.name}
            </div>
            {competitor.isDMPilot && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                ← here
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Comparison notes */}
      <div className="mt-8 space-y-4">
        {competitors.filter(c => !c.isDMPilot).map((competitor) => (
          <div key={competitor.name} className="flex items-start gap-4">
            <span className="font-semibold text-gray-900">{competitor.name}.</span>
            <span className="text-gray-600">
              {competitor.name === 'ManyChat' && 'Great chatbot platform. We just added Instagram DM focus and personal touch.'}
              {competitor.name === 'Buffer' && 'Powerful social media management. DMPilot is opinionated about DMs — fewer features, more conversions.'}
              {competitor.name === 'Hootsuite' && 'Enterprise social suite. DMPilot is focused on creator DMs — simpler, more effective.'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
