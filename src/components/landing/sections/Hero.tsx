'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function Hero() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      // TODO: Connect to actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      {/* SVG Cloud decorations */}
      <div className="absolute top-20 left-[10%] opacity-80 animate-[float_6s_ease-in-out_infinite]">
        <svg width="140" height="50" viewBox="0 0 140 50" fill="rgba(255,255,255,0.5)" opacity="0.9">
          <ellipse cx="70" cy="35" rx="70" ry="15" />
          <ellipse cx="50" cy="25" rx="40" ry="20" />
          <ellipse cx="90" cy="28" rx="35" ry="18" />
        </svg>
      </div>
      <div className="absolute top-16 right-[15%] opacity-60 animate-[float_8s_ease-in-out_infinite_1s]">
        <svg width="100" height="35" viewBox="0 0 100 35" fill="rgba(255,255,255,0.4)" opacity="0.8">
          <ellipse cx="50" cy="20" rx="50" ry="15" />
          <ellipse cx="35" cy="15" rx="30" ry="12" />
        </svg>
      </div>

      {/* SVG Mountain layers at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Far mountain layer */}
        <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none" style={{ height: '280px' }}>
          <path d="M0,320 L0,200 Q200,80 400,180 Q550,100 720,160 Q900,60 1100,140 Q1250,80 1440,160 L1440,320 Z" fill="var(--hero-mountain)" opacity="0.7" />
        </svg>
        {/* Near mountain layer */}
        <svg viewBox="0 0 1440 280" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: '220px' }}>
          <path d="M0,280 L0,180 Q180,100 360,160 Q500,80 700,150 Q850,60 1050,130 Q1200,70 1440,140 L1440,280 Z" fill="var(--hero-mountain-dark)" opacity="0.8" />
        </svg>
        {/* Ground layer */}
        <svg viewBox="0 0 1440 160" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path d="M0,160 L0,80 Q360,40 720,80 Q1080,120 1440,60 L1440,160 Z" fill="#4a7261" />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Badge with line decoration */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 justify-center mb-8"
        >
          <div className="h-px w-12" style={{ background: 'var(--text-muted)' }} />
          <span className="font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)' }}>
            CALM ENGAGEMENT · PRIVATE BETA
          </span>
          <div className="h-px w-12" style={{ background: 'var(--text-muted)' }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-bold tracking-tight mb-6 leading-tight"
          style={{ color: '#000000', fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          End the day knowing you actually connected.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}
        >
          A calm DM automation tool that helps you respond without losing the personal touch.
        </motion.p>

        {/* Email Form - Combined Pill */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto mb-4"
        >
          <div className="flex items-center rounded-full p-1.5 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)', boxShadow: 'var(--shadow-md)' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.co"
              required
              className="flex-1 px-6 py-3 bg-transparent outline-none rounded-full"
              style={{ color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-full font-semibold text-white flex items-center gap-2 transition-all"
              style={{ background: 'var(--accent)', fontSize: 'var(--font-sm)', boxShadow: 'var(--shadow-sm)' }}
            >
              Start your day <span className="text-base">↗</span>
            </button>
          </div>
        </motion.form>

        {status === 'success' && (
          <p className="text-sm text-green-600 text-center">Welcome to the calm crew! Check your email.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500 text-center">Something went wrong. Try again?</p>
        )}

        <p className="text-center mt-2" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)' }}>
          Join the calm crew already in beta. No spam.
        </p>

        {/* Browser mockup - peeks from bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mt-16 max-w-4xl mx-auto"
        >
          <div className="rounded-t-xl overflow-hidden border" style={{ boxShadow: 'var(--shadow-lg)', borderColor: 'var(--surface-2)' }}>
            {/* Browser chrome */}
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--surface-1)' }}>
              <div className="flex gap-1.5">
                <div className="rounded-full" style={{ width: '12px', height: '12px', background: '#f87171' }} />
                <div className="rounded-full" style={{ width: '12px', height: '12px', background: '#fbbf24' }} />
                <div className="rounded-full" style={{ width: '12px', height: '12px', background: '#34d399' }} />
              </div>
              <div className="flex-1 mx-4">
                <div className="rounded-md px-3 py-1 max-w-xs" style={{ background: 'var(--surface-1)', color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                  dashboard.dmpilot.com/inbox
                </div>
              </div>
            </div>
            {/* Screenshot placeholder */}
            <div className="h-64 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, var(--surface-1), var(--surface-0))', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              DMPilot Dashboard Screenshot
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
