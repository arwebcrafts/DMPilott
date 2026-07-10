'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, MessageSquare, BarChart3, CheckCircle2 } from 'lucide-react';

function DashboardMockup() {
  return (
    <div className="rounded-t-2xl overflow-hidden border shadow-2xl" style={{ borderColor: 'var(--surface-2)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="rounded-md px-3 py-1 text-xs max-w-xs mx-auto text-center" style={{ background: 'var(--surface-0)', color: 'var(--text-muted)' }}>
            dmpilott.vercel.app/dashboard
          </div>
        </div>
      </div>
      <div className="p-5 grid grid-cols-12 gap-4 min-h-[280px]" style={{ background: 'var(--surface-0)' }}>
        <div className="col-span-3 hidden sm:block space-y-2">
          {['Overview', 'Automations', 'Analytics', 'Link in Bio'].map((item, i) => (
            <div
              key={item}
              className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 1 ? 'text-white' : ''}`}
              style={{
                background: i === 1 ? 'linear-gradient(90deg, #F58529, #DD2A7B)' : 'var(--surface-1)',
                color: i === 1 ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="col-span-12 sm:col-span-9 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'DMs sent', value: '1,247', icon: MessageSquare },
              { label: 'Active rules', value: '3', icon: Zap },
              { label: 'This month', value: '89', icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl p-3 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}>
                <Icon className="w-4 h-4 text-[#DD2A7B] mb-2" />
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Comment → DM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">Active</span>
            </div>
            <div className="space-y-2">
              {[
                { user: '@style_lover', msg: 'DM sent · keyword: PRICE' },
                { user: '@new_fan', msg: 'DM sent · any comment' },
              ].map((row) => (
                <div key={row.user} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'var(--surface-0)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.user}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{row.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden"
      style={{ background: 'var(--surface-0)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(221,42,123,0.25) 0%, transparent 70%)' }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full" preserveAspectRatio="none" style={{ height: '140px' }}>
          <path d="M0,200 L0,120 Q360,60 720,100 Q1080,140 1440,80 L1440,200 Z" fill="var(--section-cool)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: 'var(--surface-2)', color: 'var(--text-secondary)', background: 'var(--surface-1)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Comment-to-DM · Instagram & Facebook
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-bold tracking-tight mb-6 leading-[1.1]"
          style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)' }}
        >
          Turn every comment into a{' '}
          <span style={{ background: 'linear-gradient(90deg, #F58529, #DD2A7B, #8134AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            customer conversation
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 leading-relaxed max-w-2xl mx-auto text-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          DMPilot automatically DMs everyone who comments on your posts and reels. Plus a built-in Link in Bio page. Official Meta APIs, no bots.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
        >
          <Link
            href="/signup"
            className="px-8 py-4 rounded-full font-semibold text-white text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            style={{ background: 'linear-gradient(90deg, #F58529, #DD2A7B)' }}
          >
            Start free →
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-full font-semibold text-base border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
          >
            See all features
          </a>
        </motion.div>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Free plan · 300 DMs/month · No credit card
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mt-16 max-w-4xl mx-auto"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
