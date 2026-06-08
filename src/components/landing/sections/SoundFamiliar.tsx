'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { NotificationVisualization } from '@/components/landing/visual-storytelling/NotificationVisualization';

export function SoundFamiliar() {
  return (
    <SectionContainer padding="xl" id="sound-familiar" className="bg-gray-50">
      <SectionHeader
        title="Sound familiar?"
        subtitle="Your Instagram, right now."
        description="Eight things demanding your attention before you've had coffee. Nobody's lazy. Nobody's broken. We're just buried under everyone else's urgency."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <NotificationVisualization />
      </div>
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <p className="text-lg text-gray-600">
          If you've ever wondered about the <span className="font-semibold">47 DMs pending meaning</span> on your Instagram, the answer is simple — that's your brain's 47 tabs open, made visible. It's the difference between busy-ness and being productive: <span className="font-semibold">busy looks like motion. Productivity looks like quiet, finished things.</span>
        </p>
        <p className="mt-4 text-gray-500">
          DMPilot starts the day <span className="font-semibold">before</span> this does.
        </p>
      </div>
    </SectionContainer>
  );
}
