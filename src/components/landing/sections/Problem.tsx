'use client';

import { motion } from 'framer-motion';
import { Clock, MessageSquare, TrendingDown, AlertTriangle } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { StatCard } from '../shared/StatCard';

export function Problem() {
  const stats = [
    {
      value: '12+',
      label: 'Hours to respond manually',
      icon: <Clock className="h-6 w-6" />,
      description: 'Average response time for creators',
    },
    {
      value: '45%',
      label: 'Comments go unanswered',
      icon: <MessageSquare className="h-6 w-6" />,
      description: 'Due to time constraints',
    },
    {
      value: '3x',
      label: 'Lower conversion rate',
      icon: <TrendingDown className="h-6 w-6" />,
      description: 'Compared to instant responses',
      trend: 'down' as const,
      trendValue: 'Revenue loss',
    },
  ];

  const painPoints = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Time-Consuming Manual Responses',
      description: 'Hours spent every day responding to comments and DMs manually, taking you away from creating content.',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Missed Opportunities',
      description: 'By the time you respond, the moment is gone. Commenters move on, and potential customers are lost.',
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: 'Inconsistent Messaging',
      description: 'Manual responses vary in quality and tone, leading to inconsistent brand experience.',
    },
    {
      icon: <TrendingDown className="h-8 w-8" />,
      title: 'Scaling Bottleneck',
      description: 'As your audience grows, manual DM management becomes impossible without hiring more staff.',
    },
  ];

  return (
    <SectionContainer variant="light" padding="xl" id="problem">
      <SectionHeader
        title="The Problem: Manual DMs Don't Scale"
        subtitle="Creators are losing customers because they can't keep up with DMs"
        description="Instagram DMs are the #1 way creators convert followers into customers. But manual responses are slow, inconsistent, and don't scale."
        align="center"
        size="lg"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {painPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 border"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-start gap-4">
              <div style={{ color: 'var(--accent)' }} className="flex-shrink-0">{point.icon}</div>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-lg)' }}>
                  {point.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
                  {point.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Source */}
      <div className="mt-12 text-center">
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
          Source: Instagram Business Survey 2024, Harvard Business Review
        </p>
      </div>
    </SectionContainer>
  );
}
