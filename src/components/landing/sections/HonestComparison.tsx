'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { PositioningMatrix } from '@/components/landing/visual-storytelling/PositioningMatrix';

export function HonestComparison() {
  return (
    <SectionContainer padding="lg" id="honest-comparison" className="section-cool">
      <SectionHeader
        title="Honest Comparison"
        subtitle="Where each tool sits."
        description="Plotted by how much they hold and how loud they get. DMPilot lives in a different corner."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <PositioningMatrix />
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Not a replacement.</p>
        <p style={{ color: 'var(--text-secondary)' }}>The calm wrapper around your DM strategy.</p>
      </div>
    </SectionContainer>
  );
}
