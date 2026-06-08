'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { TransitDiagram } from '@/components/landing/visual-storytelling/TransitDiagram';

export function MeetsYouWhere() {
  return (
    <SectionContainer padding="xl" id="meets-you-where">
      <SectionHeader
        title="Meets You Where You Work"
        subtitle="Six lines. One station."
        description="Wherever a DM starts, it ends up at DMPilot Central."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <TransitDiagram />
      </div>
    </SectionContainer>
  );
}
