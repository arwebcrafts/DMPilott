'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';

export function FAQ() {
  const messages = [
    { type: 'user', text: 'How does DMPilot work?' },
    { type: 'bot', text: 'DMPilot connects to your Instagram account using official APIs. When someone comments on your posts or sends you a DM, our AI analyzes the context and generates a personalized response based on your configured templates. You can review and approve responses before they\'re sent, ensuring full control.' },
    { type: 'user', text: 'Will my followers know the responses are automated?' },
    { type: 'bot', text: 'Not unless you tell them. Our AI is trained to respond in your authentic voice, and responses feel natural and personal. Many of our users report that their followers can\'t tell the difference between AI and manual responses.' },
    { type: 'user', text: 'Is my data secure?' },
    { type: 'bot', text: 'Absolutely. We use bank-level encryption to protect your data. We never share your information with third parties, and we comply with all data protection regulations including GDPR. Your DMs are processed securely and never stored longer than necessary.' },
    { type: 'user', text: 'Can I customize the AI responses?' },
    { type: 'bot', text: 'Yes! You have full control over response templates, tone, and style. You can create different workflows for different types of comments, set approval rules, and even manually intervene when needed. The AI learns from your preferences over time.' },
  ];

  return (
    <SectionContainer padding="xl" id="faq">
      <div className="max-w-2xl mx-auto">
        {/* Chat Header */}
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ background: 'var(--surface-1)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="text-white font-bold">D</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>DMPilot</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Online · Usually replies instantly</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 mb-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.type === 'user'
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
                style={{
                  background: msg.type === 'user' ? 'var(--accent)' : 'var(--surface-1)',
                  borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                }}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chat Input Placeholder */}
        <div className="p-3 rounded-xl border flex items-center gap-2" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <button className="p-2 rounded-full" style={{ background: 'var(--accent)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
            Still have questions?
          </p>
          <a
            href="mailto:support@dmpilot.com"
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Contact our support team
          </a>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
