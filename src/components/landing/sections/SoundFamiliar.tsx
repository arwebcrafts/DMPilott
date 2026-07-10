'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { NotificationVisualization } from '@/components/landing/visual-storytelling/NotificationVisualization';

export function SoundFamiliar() {
  return (
    <SectionContainer padding="lg" id="sound-familiar" className="section-warm">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-gray-500 dark:text-gray-400">SOUND FAMILIAR?</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-display)' }}>
          Your Instagram, right now.
        </h2>
        <p className="text-lg mb-2 text-gray-600 dark:text-gray-300">
          Eight things demanding your attention before you&apos;ve had coffee. Nobody&apos;s lazy. Nobody&apos;s broken. We&apos;re just buried under everyone else&apos;s urgency.
        </p>
      </div>
      <div className="mt-12">
        <NotificationVisualization />
      </div>
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          If you&apos;ve ever wondered about the <strong className="text-gray-900 dark:text-gray-100">47 DMs pending meaning</strong> on your Instagram, the answer is simple — that&apos;s your brain&apos;s 47 tabs open, made visible. It&apos;s the difference between busy-ness and being productive: <strong className="text-gray-900 dark:text-gray-100">busy looks like motion. Productivity looks like quiet, finished things.</strong>
        </p>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
          DMPilot starts the day <em className="text-gray-900 dark:text-gray-100 italic">before</em> this does.
        </p>
      </div>
    </SectionContainer>
  );
}
