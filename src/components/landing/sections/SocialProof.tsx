'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function SocialProof() {
  const testimonials = [
    {
      letter: 'S',
      name: 'Sarah Chen',
      handle: '@sarahcreates',
      role: 'E-commerce Creator',
      quote: 'First week with DMPilot: shipped 3 products, missed zero DMs, closed the laptop at 6. I hadn\'t done that in two years.',
    },
    {
      letter: 'D',
      name: 'Devon Park',
      handle: '@devonp',
      role: 'Business Coach',
      quote: 'Replaced manual DMs, my response templates, and the spreadsheet I was using to track conversations. One tab.',
    },
    {
      letter: 'M',
      name: 'Maya Reyes',
      handle: '@maya_writes',
      role: 'Writer & parent',
      quote: 'Voice capture between drop-off and coffee. The DMs actually showed up later. Magical.',
    },
    {
      letter: 'R',
      name: 'Rohan Iyer',
      handle: '@rohaniyer',
      role: 'PM at series-B',
      quote: 'Instagram went quiet for the first time since onboarding.',
    },
    {
      letter: 'L',
      name: 'Lina Sato',
      handle: '@lina.sato',
      role: 'Indie illustrator',
      quote: 'I forgot what "feeling done" felt like. DMPilot gave it back, on a Tuesday.',
    },
  ];

  return (
    <SectionContainer padding="xl" id="social-proof">
      <SectionHeader
        title="From the Calm Crew"
        subtitle="Already in beta"
        description="Five creators who finished their day feeling done."
        align="center"
        size="lg"
      />

      {/* Testimonials */}
      <div className="space-y-8 max-w-3xl mx-auto">
        {testimonials.map((testimonial) => (
          <div key={testimonial.letter} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {testimonial.letter}
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-900 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{testimonial.name}</span>
                <span className="text-gray-400">@</span>
                <span className="text-gray-600">{testimonial.handle}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">{testimonial.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
