'use client';

import { motion } from 'framer-motion';

interface TimelineEvent {
  time: string;
  activity: string;
  duration: string;
  category: 'focus' | 'meetings' | 'slack' | 'email' | 'lunch' | 'refocus';
}

const events: TimelineEvent[] = [
  { time: '9 AM', activity: 'Settle in', duration: '15m', category: 'refocus' },
  { time: '9:15 AM', activity: 'Focus', duration: '20m', category: 'focus' },
  { time: '9:35 AM', activity: 'Slack ping', duration: '4m', category: 'slack' },
  { time: '9:39 AM', activity: 'Refocus', duration: '17m', category: 'refocus' },
  { time: '9:56 AM', activity: 'Focus', duration: '28m', category: 'focus' },
  { time: '10:24 AM', activity: 'Email check', duration: '6m', category: 'email' },
  { time: '10:30 AM', activity: 'Refocus', duration: '12m', category: 'refocus' },
  { time: '10:42 AM', activity: 'Focus', duration: '18m', category: 'focus' },
  { time: '11:00 AM', activity: 'Standup', duration: '30m', category: 'meetings' },
  { time: '11:30 AM', activity: 'Coffee', duration: '5m', category: 'lunch' },
  { time: '11:35 AM', activity: 'Focus', duration: '25m', category: 'focus' },
  { time: '12:00 PM', activity: 'Lunch', duration: '45m', category: 'lunch' },
];

const categoryColors: Record<TimelineEvent['category'], string> = {
  focus: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  meetings: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
  slack: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
  email: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  lunch: 'bg-[color:var(--surface-2)] text-[color:var(--text-secondary)]',
  refocus: 'bg-red-500/15 text-red-600 dark:text-red-300',
};

function StatBlock({ value, label, meta, accent }: { value: string; label: string; meta: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div
        className="text-2xl font-bold"
        style={{ color: accent ? 'var(--error)' : 'var(--text-primary)' }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta}</div>
    </div>
  );
}

export function TimelineVisualization() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {['9 AM', '10', '11', '12', '1 PM'].map((t) => (
          <span key={t} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{t}</span>
        ))}
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-lg ${categoryColors[event.category]}`}
          >
            <span className="text-xs font-medium w-16">{event.time}</span>
            <span className="text-sm flex-1">{event.activity}</span>
            <span className="text-xs font-medium w-12">{event.duration}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBlock value="2h 36m" label="ACTUAL FOCUS" meta="33% of the day" />
        <StatBlock value="2h" label="MEETINGS" meta="25% of the day" />
        <StatBlock value="1h 7m" label="SLACK + EMAIL" meta="14% of the day" />
        <StatBlock value="47m" label="LOST TO REFOCUS" meta="10% of the day" accent />
      </div>
    </div>
  );
}
