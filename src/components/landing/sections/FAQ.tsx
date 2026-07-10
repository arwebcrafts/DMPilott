'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';

const faqs = [
  {
    q: 'How does comment-to-DM automation work?',
    a: 'Connect your Instagram or Facebook account, create an automation with a trigger (keyword or any comment), and write your DM template. When someone comments, DMPilot sends them a DM via official Meta APIs.',
  },
  {
    q: 'Does it work on reels and posts?',
    a: 'Yes. Any comment on your Instagram posts or reels triggers the automation. Same for Facebook Page posts.',
  },
  {
    q: 'Is this allowed by Instagram?',
    a: 'Yes. DMPilot uses official Meta APIs (Instagram Business Login and Facebook Graph API). You connect your own account and grant permissions through Meta OAuth.',
  },
  {
    q: 'What is the Link in Bio feature?',
    a: 'A built-in link page like Linktree. Add links, videos, product cards, and email capture. Custom themes, click analytics, and a shareable URL for your Instagram bio. Included in DMPilot.',
  },
  {
    q: 'Do you use AI to write messages?',
    a: 'Not yet. You write your own DM templates today. AI response suggestions are on our roadmap. Everything sent now is exactly what you configure.',
  },
  {
    q: 'Is my data secure?',
    a: 'Access tokens are encrypted at rest. We use Supabase for auth and database. We only access what Meta permissions you grant. See our privacy policy for details.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionContainer padding="lg" id="faq">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Questions & answers
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Straight answers about what DMPilot does today.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold pr-4" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                <span className="text-xl flex-shrink-0" style={{ color: 'var(--accent)' }}>
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="mailto:arwebcrafts@gmail.com" className="text-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Still have questions? Email us →
          </a>
        </div>
      </div>
    </SectionContainer>
  );
}
