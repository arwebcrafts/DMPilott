'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Target, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { FeatureCard } from '../shared/FeatureCard';

export function Solution() {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Responses',
      description: 'Respond to comments and DMs within minutes, not hours. AI-powered responses that feel personal and authentic.',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Smart Conversations',
      description: 'Our AI understands context and maintains conversation threads, so every response feels natural and on-brand.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Conversion Focused',
      description: 'Every response is optimized to guide commenters toward your goals—whether that\'s a sale, signup, or engagement.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Safe & Secure',
      description: 'Your data is encrypted and never shared. Full control over what gets automated and what stays manual.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Analytics Dashboard',
      description: 'Track response times, conversion rates, and engagement metrics. Know exactly what\'s working.',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Customizable Workflows',
      description: 'Create custom response templates and workflows for different types of comments and audiences.',
    },
  ];

  const benefits = [
    {
      value: '5min',
      label: 'Average response time',
      description: 'Down from 12+ hours',
    },
    {
      value: '3x',
      label: 'Higher conversion rate',
      description: 'Compared to manual responses',
    },
    {
      value: '10hrs',
      label: 'Saved per week',
      description: 'Time back for creating content',
    },
  ];

  return (
    <SectionContainer padding="xl" id="solution">
      <SectionHeader
        title="The Solution: DMPilot"
        subtitle="Automate your DMs without losing the personal touch"
        description="DMPilot uses AI to respond to Instagram comments and DMs instantly, while maintaining the authentic voice that your followers love."
        align="center"
        size="lg"
        badge="How It Works"
      />

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="font-bold mb-2" style={{ color: 'var(--accent)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              {benefit.value}
            </div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-lg)' }}>{benefit.label}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </SectionContainer>
  );
}
