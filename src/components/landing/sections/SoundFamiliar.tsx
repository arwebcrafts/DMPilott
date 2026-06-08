'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { NotificationVisualization } from '@/components/landing/visual-storytelling/NotificationVisualization';

export function SoundFamiliar() {
  return (
    <SectionContainer padding="xl" id="sound-familiar" className="section-warm">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>SOUND FAMILIAR?</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Your Instagram, right now.
        </h2>
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          Eight things demanding your attention before you&apos;ve had coffee. Nobody&apos;s lazy. Nobody&apos;s broken. We&apos;re just buried under everyone else&apos;s urgency.
        </p>
      </div>
      <div className="mt-12">
        <NotificationVisualization />
      </div>
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          If you&apos;ve ever wondered about the <strong style={{ color: 'var(--text-primary)' }}>47 DMs pending meaning</strong> on your Instagram, the answer is simple — that&apos;s your brain&apos;s 47 tabs open, made visible. It&apos;s the difference between busy-ness and being productive: <strong style={{ color: 'var(--text-primary)' }}>busy looks like motion. Productivity looks like quiet, finished things.</strong>
        </p>
        <p className="mt-4 text-base" style={{ color: 'var(--text-muted)' }}>
          DMPilot starts the day <em style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>before</em> this does.
        </p>
      </div>
    </SectionContainer>
  );
}
