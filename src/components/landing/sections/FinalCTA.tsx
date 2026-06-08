'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { useState } from 'react';

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <SectionContainer padding="xl" id="join" className="section-warm">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <p className="text-sm font-medium tracking-widest uppercase mb-4 text-gray-500 dark:text-gray-400">START YOUR DAY</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-display)' }}>
            When the day starts quiet, the day ends done.
          </h2>
        </div>

        <div className="card-warm p-8 mb-8">
          <p className="mb-4 text-gray-600 dark:text-gray-300">Hi friend,</p>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Most apps want you to do more. <strong className="text-gray-900 dark:text-gray-100">DMPilot wants you to feel done.</strong>
          </p>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Drop your email. We'll send a thoughtful invite when there's room — never a marketing blast, never a countdown.
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="flex-1 px-4 py-3 rounded-lg border outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: 'var(--accent)' }}
              >
                Start your day
              </button>
            </div>
            {status === 'success' && (
              <p className="text-sm text-green-600 text-center mt-2">Welcome to the calm crew!</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 text-center mt-2">Something went wrong. Try again?</p>
            )}
          </form>
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">With calm,</p>
            <p className="text-gray-600 dark:text-gray-300">— The DMPilot team</p>
          </div>
        </div>

        {/* Scrolling Marquee */}
        <div className="overflow-hidden py-4" style={{ background: 'var(--surface-1)' }}>
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">JOIN THE CALM CREW</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">ALREADY IN BETA</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">QUIET ON PURPOSE</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">CALM ENGAGEMENT</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">PRIVATE BETA</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">START YOUR DAY</span>
                <span style={{ color: 'var(--accent)' }}>•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
