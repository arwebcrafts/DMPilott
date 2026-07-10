'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';
import { Link2, Zap, MessageSquare, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    step: '1',
    title: 'Connect your account',
    desc: 'Link your Instagram Business or Facebook Page through official Meta OAuth. Takes under 2 minutes.',
  },
  {
    icon: Zap,
    step: '2',
    title: 'Create an automation',
    desc: 'Pick a trigger: any comment, a keyword like "LINK", or incoming DMs. Write your message template.',
  },
  {
    icon: MessageSquare,
    step: '3',
    title: 'Someone comments',
    desc: 'A follower comments on your post or reel. DMPilot catches it instantly via Meta webhooks.',
  },
  {
    icon: CheckCircle2,
    step: '4',
    title: 'DM sent automatically',
    desc: 'They get your personalized DM. Optionally, a public reply appears under their comment.',
  },
];

export function DayInDMPilot() {
  return (
    <SectionContainer padding="lg" id="how-it-works">
      <SectionHeader
        title="How it works"
        subtitle="4 steps"
        description="From signup to your first automated DM in minutes."
        align="center"
        size="lg"
      />
      <div className="mt-14 max-w-3xl mx-auto">
        <div className="relative">
          <div
            className="absolute left-6 top-4 bottom-4 w-px hidden md:block"
            style={{ background: 'linear-gradient(to bottom, #DD2A7B, #8134AF)' }}
          />
          <div className="space-y-8">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-6 md:pl-16"
                >
                  <div
                    className="hidden md:flex absolute left-0 w-12 h-12 rounded-xl items-center justify-center text-white font-bold text-sm z-10"
                    style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B)' }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="flex-1 rounded-2xl border p-6 flex gap-4"
                    style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
                  >
                    <Icon className="w-6 h-6 text-[#DD2A7B] flex-shrink-0 mt-0.5 md:hidden" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
