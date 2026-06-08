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

const categoryColors = {
  focus: 'bg-blue-100 text-blue-700',
  meetings: 'bg-purple-100 text-purple-700',
  slack: 'bg-orange-100 text-orange-700',
  email: 'bg-green-100 text-green-700',
  lunch: 'bg-gray-100 text-gray-700',
  refocus: 'bg-red-100 text-red-700',
};

export function TimelineVisualization() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-medium text-gray-600">9 AM</span>
        <span className="text-sm font-medium text-gray-600">10</span>
        <span className="text-sm font-medium text-gray-600">11</span>
        <span className="text-sm font-medium text-gray-600">12</span>
        <span className="text-sm font-medium text-gray-600">1 PM</span>
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
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">2h 36m</div>
          <div className="text-sm text-gray-600">ACTUAL FOCUS</div>
          <div className="text-xs text-gray-400">33% of the day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">2h</div>
          <div className="text-sm text-gray-600">MEETINGS</div>
          <div className="text-xs text-gray-400">25% of the day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">1h 7m</div>
          <div className="text-sm text-gray-600">SLACK + EMAIL</div>
          <div className="text-xs text-gray-400">14% of the day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">47m</div>
          <div className="text-sm text-gray-600">LOST TO REFOCUS</div>
          <div className="text-xs text-gray-400">10% of the day</div>
        </div>
      </div>
    </div>
  );
}
