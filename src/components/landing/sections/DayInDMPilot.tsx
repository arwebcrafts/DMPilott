'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';

const timeBlocks = [
  { type: 'RITUAL', time: '06:30', title: 'Morning ritual', desc: 'A 5-minute ritual lands you in your day before the world does.' },
  { type: 'DEEP', time: '09:00', title: 'Deep block', desc: 'Notifications off automatically. Instagram stays away. Plant grows on screen.' },
  { type: 'ADMIN', time: '11:15', title: 'Reply queue', desc: 'Triage in 90 seconds. Email + Instagram DMs.' },
  { type: 'REST', time: '13:00', title: 'Lunch', desc: 'Actual lunch. No notifications.' },
  { type: 'DEEP', time: '14:00', title: 'Deep block', desc: 'Content creation. Notifications off. Plant growing.' },
  { type: 'REVIEW', time: '16:15', title: 'Wins logged', desc: 'The day\'s done logs itself. You see what moved before you close.' },
  { type: 'CLOSE', time: '17:00', title: 'Close', desc: 'Tomorrow\'s three are already drafted. Inbox quiet. Laptop shut.' },
];

const typeColors: Record<string, string> = {
  RITUAL: '#e85d3a',
  DEEP: '#3b82f6',
  ADMIN: '#8b5cf6',
  REST: '#22c55e',
  REVIEW: '#eab308',
  CLOSE: '#6b7280',
};

export function DayInDMPilot() {
  return (
    <SectionContainer padding="xl" id="day-in-dmpilot">
      <SectionHeader
        title="A Day in DMPilot"
        subtitle="Your Tuesday, already calmer."
        description="Three deep blocks. Two short rituals. One quiet day. Here's what a DMPilot day actually looks like."
        align="center"
        size="lg"
      />
      <div className="mt-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Visual Calendar (3/5 width) */}
          <div className="lg:col-span-3">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{ background: 'var(--surface-1)' }}>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>TODAY</span>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tuesday, May 5</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">On track</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>3 deep · 2 rituals</span>
              </div>
            </div>
            {/* Time axis + colored blocks */}
            <div className="space-y-2">
              {timeBlocks.map((block, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl border"
                  style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
                >
                  <div className="flex-shrink-0 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{block.time}</div>
                  <div className="flex-1 h-12 rounded-lg" style={{ background: typeColors[block.type], opacity: 0.8 }} />
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: typeColors[block.type], color: 'white' }}>{block.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Annotations (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Annotation cards with ← arrows */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: '#e85d3a', background: 'var(--surface-1)' }}
            >
              <div className="text-xs font-bold" style={{ color: '#e85d3a' }}>← 06:30 · RITUAL</div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                A 5-minute ritual lands you in your day before the world does.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: '#3b82f6', background: 'var(--surface-1)' }}
            >
              <div className="text-xs font-bold" style={{ color: '#3b82f6' }}>← 09:00 · DEEP</div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Notifications off automatically. Instagram stays away. Plant grows on screen.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: '#22c55e', background: 'var(--surface-1)' }}
            >
              <div className="text-xs font-bold" style={{ color: '#22c55e' }}>← 13:00 · REST</div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Actual lunch. No notifications.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: '#6b7280', background: 'var(--surface-1)' }}
            >
              <div className="text-xs font-bold" style={{ color: '#6b7280' }}>← 17:00 · CLOSE</div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Tomorrow's three are already drafted. Inbox quiet. Laptop shut.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Six small moments.</p>
        <p style={{ color: 'var(--text-muted)' }}>One quiet day.</p>
      </div>
    </SectionContainer>
  );
}
