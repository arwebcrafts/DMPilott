'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does DMPilot work?',
      answer: 'DMPilot connects to your Instagram account using official APIs. When someone comments on your posts or sends you a DM, our AI analyzes the context and generates a personalized response based on your configured templates. You can review and approve responses before they\'re sent, ensuring full control.',
    },
    {
      question: 'Will my followers know the responses are automated?',
      answer: 'Not unless you tell them. Our AI is trained to respond in your authentic voice, and responses feel natural and personal. Many of our users report that their followers can\'t tell the difference between AI and manual responses.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption to protect your data. We never share your information with third parties, and we comply with all data protection regulations including GDPR. Your DMs are processed securely and never stored longer than necessary.',
    },
    {
      question: 'Can I customize the AI responses?',
      answer: 'Yes! You have full control over response templates, tone, and style. You can create different workflows for different types of comments, set approval rules, and even manually intervene when needed. The AI learns from your preferences over time.',
    },
    {
      question: 'What if I need help setting up?',
      answer: 'We offer comprehensive onboarding support including video tutorials, documentation, and one-on-one setup assistance. Our support team is available via email and chat to help you get started.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time with no penalties. We offer a 14-day free trial so you can try DMPilot risk-free before committing.',
    },
  ];

  return (
    <SectionContainer padding="xl" id="faq">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Got questions? We've got answers"
        description="Everything you need to know about DMPilot. Can't find what you're looking for? Contact our support team."
        align="center"
        size="lg"
      />

      <div className="max-w-3xl mx-auto space-y-4" role="region" aria-label="Frequently asked questions">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600 mb-2">
          Still have questions?
        </p>
        <a
          href="mailto:support@dmpilot.com"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Contact our support team
        </a>
      </motion.div>
    </SectionContainer>
  );
}
