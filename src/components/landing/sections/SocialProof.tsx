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

  const stats = [
    { value: '2,400+', label: 'Creators in beta' },
    { value: '1.2M+', label: 'DMs automated' },
    { value: '98%', label: 'Response rate' },
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

      {/* Social Proof Counter */}
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-xl"
              style={{ background: 'var(--surface-1)' }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials - Card Grid */}
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.letter}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-warm"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--accent)' }}>
                {testimonial.letter}
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{testimonial.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{testimonial.role}</div>
              </div>
            </div>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              "{testimonial.quote}"
            </p>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {testimonial.handle}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
