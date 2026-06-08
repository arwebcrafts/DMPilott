'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { PositioningMatrix } from '@/components/landing/visual-storytelling/PositioningMatrix';

export function HonestComparison() {
  return (
    <SectionContainer padding="xl" id="honest-comparison" className="bg-gray-50">
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
        <p className="text-lg font-medium text-gray-900">Not a replacement.</p>
        <p className="text-gray-600">The calm wrapper around your DM strategy.</p>
      </div>
    </SectionContainer>
  );
}
