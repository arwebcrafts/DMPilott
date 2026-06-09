'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { TimelineVisualization } from '@/components/landing/visual-storytelling/TimelineVisualization';

export function CostOfManual() {
  return (
    <SectionContainer padding="xl" id="cost-of-manual">
      <SectionHeader
        title="The Cost of Manual"
        subtitle="Your 8 hours, on paper."
        description="We tracked one creator's typical day, minute by minute. Here's where it actually went."
        align="center"
        size="lg"
        className="custom-black-title"
      />
      <div className="mt-12">
        <TimelineVisualization />
      </div>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-gray-900">1,200</div>
          <div className="text-sm text-gray-600">APP SWITCHES / DAY</div>
          <div className="text-xs text-gray-400 mt-1">Instagram, 2024</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">23 min</div>
          <div className="text-sm text-gray-600">TO REFOCUS</div>
          <div className="text-xs text-gray-400 mt-1">UC Irvine</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">67%</div>
          <div className="text-sm text-gray-600">BURNT OUT BY FRIDAY</div>
          <div className="text-xs text-gray-400 mt-1">Gallup, 2024</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">45%</div>
          <div className="text-sm text-gray-600">DMs GO UNANSWERED</div>
          <div className="text-xs text-gray-400 mt-1">Our data</div>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-xl font-medium text-gray-900">It's not a willpower problem.</p>
        <p className="text-gray-600">It's a tool problem.</p>
      </div>
    </SectionContainer>
  );
}
