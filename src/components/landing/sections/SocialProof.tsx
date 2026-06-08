'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { TestimonialCard } from '../shared/TestimonialCard';
import { StatisticDisplay } from '../data-viz/StatisticDisplay';

export function SocialProof() {
  const testimonials = [
    {
      quote: 'DMPilot transformed how I handle Instagram DMs. I went from spending 4 hours a day on DMs to just 30 minutes. My conversion rate increased by 250%.',
      author: 'Sarah Chen',
      role: 'E-commerce Creator',
      avatar: '/images/avatars/sarah.jpg',
      rating: 5,
    },
    {
      quote: 'The AI responses feel so personal that my followers can\'t tell they\'re automated. I\'ve booked 3x more consultations since using DMPilot.',
      author: 'Marcus Johnson',
      role: 'Business Coach',
      avatar: '/images/avatars/marcus.jpg',
      rating: 5,
    },
    {
      quote: 'As a course creator, responding to every inquiry was impossible. DMPilot handles it all while I focus on creating content. Game changer.',
      author: 'Emily Rodriguez',
      role: 'Course Creator',
      avatar: '/images/avatars/emily.jpg',
      rating: 5,
    },
  ];

  const statistics = [
    { value: 500, label: 'Active Creators', suffix: '+' },
    { value: 2.5, label: 'Million DMs Automated', suffix: 'M' },
    { value: 340, label: 'Average Conversion Increase', suffix: '%' },
    { value: 4.9, label: 'Average Rating', suffix: '/5' },
  ];

  return (
    <SectionContainer variant="light" padding="xl" id="social-proof">
      <SectionHeader
        title="Trusted by 500+ Creators"
        subtitle="See what our users are saying"
        description="Join creators who are already using DMPilot to turn comments into customers."
        align="center"
        size="lg"
      />

      {/* Statistics */}
      <StatisticDisplay statistics={statistics} className="mb-16" />

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>

      {/* Logos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <p className="text-sm text-gray-500 mb-8">Used by creators from</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          <div className="text-2xl font-bold text-gray-400">Shopify</div>
          <div className="text-2xl font-bold text-gray-400">Teachable</div>
          <div className="text-2xl font-bold text-gray-400">Kajabi</div>
          <div className="text-2xl font-bold text-gray-400">Gumroad</div>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
