'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { TimelineVisualization } from '@/components/landing/visual-storytelling/TimelineVisualization';

function BottomStat({ value, label, meta }: { value: string; label: string; meta: string }) {
  return (
    <div>
      <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{meta}</div>
    </div>
  );
}

export function CostOfManual() {
  return (
    <SectionContainer padding="lg" id="cost-of-manual">
      <SectionHeader
        title="The Cost of Manual"
        subtitle="Your 8 hours, on paper."
        description="We tracked one creator's typical day, minute by minute. Here's where it actually went."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <TimelineVisualization />
      </div>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <BottomStat value="1,200" label="APP SWITCHES / DAY" meta="Instagram, 2024" />
        <BottomStat value="23 min" label="TO REFOCUS" meta="UC Irvine" />
        <BottomStat value="67%" label="BURNT OUT BY FRIDAY" meta="Gallup, 2024" />
        <BottomStat value="45%" label="DMs GO UNANSWERED" meta="Our data" />
      </div>
      <div className="mt-12 text-center">
        <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
          It&apos;s not a willpower problem.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>It&apos;s a tool problem.</p>
      </div>
    </SectionContainer>
  );
}
