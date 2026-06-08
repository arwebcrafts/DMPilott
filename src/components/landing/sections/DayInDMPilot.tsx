'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';

const dayEvents = [
  { time: '06:30', type: 'RITUAL', title: 'Morning ritual', description: 'A 5-minute ritual lands you in your day before the world does.' },
  { time: '09:00', type: 'DEEP', title: 'Deep block', description: 'Notifications off automatically. Instagram stays away. Plant grows on screen.' },
  { time: '11:15', type: 'ADMIN', title: 'Reply queue', description: 'Triage in 90 seconds. Email + Instagram DMs.' },
  { time: '13:00', type: 'REST', title: 'Lunch', description: 'Actual lunch. No notifications.' },
  { time: '14:00', type: 'DEEP', title: 'Deep block', description: 'Content creation. Notifications off. Plant growing.' },
  { time: '16:15', type: 'REVIEW', title: 'Wins logged', description: 'The day\'s done logs itself. You see what moved before you close.' },
  { time: '17:00', type: 'CLOSE', title: 'Close', description: 'Tomorrow\'s three are already drafted. Inbox quiet. Laptop shut.' },
];

const typeColors: Record<string, string> = {
  RITUAL: 'bg-purple-100 text-purple-700',
  DEEP: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-orange-100 text-orange-700',
  REST: 'bg-green-100 text-green-700',
  REVIEW: 'bg-pink-100 text-pink-700',
  CLOSE: 'bg-gray-100 text-gray-700',
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
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="space-y-4">
          {dayEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                {event.type}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{event.time}</span>
                  <span className="text-gray-600">·</span>
                  <span className="font-medium text-gray-900">{event.title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-gray-900">Six small moments.</p>
          <p className="text-gray-600">One quiet day.</p>
        </div>
      </div>
    </SectionContainer>
  );
}
