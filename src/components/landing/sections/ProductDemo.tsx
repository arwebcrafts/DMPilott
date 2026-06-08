'use client';

import { motion } from 'framer-motion';
import { Play, ChevronRight, CheckCircle } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { CTAButton } from '../shared/CTAButton';

export function ProductDemo() {
  const steps = [
    {
      number: '01',
      title: 'Connect Your Instagram',
      description: 'Link your Instagram account in seconds. We use official Instagram APIs for secure integration.',
    },
    {
      number: '02',
      title: 'Set Up Your Workflows',
      description: 'Create response templates for different types of comments. Customize tone, style, and calls-to-action.',
    },
    {
      number: '03',
      title: 'Watch It Work',
      description: 'DMPilot automatically responds to comments and DMs. You can review and approve responses before sending.',
    },
    {
      number: '04',
      title: 'Track & Optimize',
      description: 'Monitor performance metrics in real-time. A/B test different responses to maximize conversions.',
    },
  ];

  return (
    <SectionContainer variant="light" padding="xl" id="demo">
      <SectionHeader
        title="See DMPilot in Action"
        subtitle="Set up in minutes, see results instantly"
        description="Watch how easy it is to automate your Instagram DMs and start converting more commenters into customers."
        align="center"
        size="lg"
      />

      {/* Demo Video Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video max-w-4xl mx-auto mb-16"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/80 text-sm">2:30 - Watch the full demo</p>
        </div>
      </motion.div>

      {/* How It Works Steps */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h3>
        
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
              </div>
              <div className="flex-1 pb-8 border-b border-gray-200 last:border-0">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <CTAButton variant="primary" size="lg" href="/signup">
          Start Your Free Trial
          <ChevronRight className="ml-2 h-5 w-5" />
        </CTAButton>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>14-day free trial</span>
          </div>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
