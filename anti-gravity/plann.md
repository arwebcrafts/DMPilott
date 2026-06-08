Let me first review the key existing components to write an accurate, file-specific implementation plan.



Here are the full contents of all requested files:

---

## 1. Navigation.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navigation() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('dmpilot-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dmpilot-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dmpilot-theme', 'light');
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="DMPilot Home" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          DMPilot
        </Link>
        
        <div role="menubar" aria-orientation="horizontal" className="hidden md:flex items-center gap-8">
          <button role="menuitem" onClick={() => scrollTo('features')} className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer" style={{ color: 'var(--text-secondary)' }}>Features</button>
          <button role="menuitem" onClick={() => scrollTo('how-it-works')} className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer" style={{ color: 'var(--text-secondary)' }}>How It Works</button>
          <button role="menuitem" onClick={() => scrollTo('pricing')} className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer" style={{ color: 'var(--text-secondary)' }}>Pricing</button>
          <button role="menuitem" onClick={() => scrollTo('faq')} className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer" style={{ color: 'var(--text-secondary)' }}>FAQ</button>
          
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <Link href="/signup">
            <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90" style={{ background: 'var(--text-primary)' }}>
              Join beta →
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

---

## 2. SideNavigation.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'HOME' },
  { id: 'problem', label: 'PROBLEM' },
  { id: 'solution', label: 'SOLUTION' },
  { id: 'how-it-works', label: 'HOW IT WORKS' },
  { id: 'stories', label: 'STORIES' },
  { id: 'faq', label: 'FAQ' },
  { id: 'join', label: 'JOIN' },
];

export function SideNavigation() {
  const [active, setActive] = useState('hero');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          aria-label={`Navigate to ${label}`}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            active === id
              ? 'bg-gray-900 text-white scale-110'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
        >
          {label.charAt(0)}
        </button>
      ))}
    </div>
  );
}
```

---

## 3. Hero.tsx

```tsx
'use client';

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
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-8" style={{ background: 'var(--surface-1)', color: 'var(--text-secondary)', border: '1px solid var(--surface-3)' }}>
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          CALM ENGAGEMENT · PRIVATE BETA
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          End the day knowing you actually connected.
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          A calm DM automation tool that helps you respond without losing the personal touch.
        </p>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="flex-1 px-5 py-3.5 rounded-xl text-base transition-colors"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--surface-3)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--text-primary)' }}
          >
            {status === 'loading' ? 'Joining...' : 'Start your day'}
          </button>
        </form>

        {status === 'success' && (
          <p className="text-sm text-green-600">Welcome to the calm crew! Check your email.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500">Something went wrong. Try again?</p>
        )}

        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Join the calm crew already in beta. No spam.
        </p>
      </div>
    </section>
  );
}
```

---

## 4. SoundFamiliar.tsx

```tsx
import { NotificationStack } from '../visual-storytelling/NotificationStack';

export function SoundFamiliar() {
  return (
    <section id="problem" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Sound familiar?
        </h2>
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          Your Instagram, right now.
        </p>
        <p className="text-base mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Eight things demanding your attention before you&apos;ve had coffee. Nobody&apos;s lazy. Nobody&apos;s broken. We&apos;re just buried under everyone else&apos;s urgency.
        </p>

        <NotificationStack />

        <div className="mt-12 max-w-2xl mx-auto text-left space-y-4">
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            If you&apos;ve ever wondered about the <strong style={{ color: 'var(--text-primary)' }}>47 DMs pending meaning</strong> on your Instagram, the answer is simple — that&apos;s your brain&apos;s 47 tabs open, made visible. It&apos;s the difference between busy-ness and being productive: <strong style={{ color: 'var(--text-primary)' }}>busy looks like motion. Productivity looks like quiet, finished things.</strong>
          </p>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            DMPilot starts the day <em style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>before</em> this does.
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 5. Problem.tsx

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const notifications = [
  { app: 'Instagram DMs', time: 'now', title: 'New message from @fashionista_ny', detail: '"Hi! Is this still available in size M?"', color: '#E1306C' },
  { app: 'Instagram', time: '2m', title: 'Comment on your latest post', detail: '"Love this! How much?" — @style_lover', color: '#833AB4' },
  { app: 'Instagram DMs', time: '5m', title: '3 unread conversations', detail: 'Product inquiries waiting for response', color: '#E1306C' },
  { app: 'Email', time: '12m', title: 'Collaboration request', detail: 'Brand partnership — needs reply by EOD', color: '#4285F4' },
  { app: 'Instagram', time: '18m', title: 'Story mention by @beauty_hub', detail: 'Tagged you in their story — respond?', color: '#F77737' },
  { app: 'Instagram DMs', time: '25m', title: 'Missed DM from potential customer', detail: '"Do you ship internationally?" — sent 2h ago', color: '#E1306C' },
  { app: 'Reminder', time: '1h', title: 'Post scheduled content', detail: 'Was due 30 min ago — audience is online now', color: '#34A853' },
  { app: 'Instagram', time: '2h', title: '47 unread DMs', detail: '12 product inquiries, 8 collab requests', color: '#C13584' },
];

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="problem-detail" className="py-24 px-6" style={{ background: 'var(--surface-1)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>THE REAL COST</p>
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Every unanswered DM is a lost sale.
            </h2>
            <div className="space-y-4">
              <p style={{ color: 'var(--text-secondary)' }}>
                The average Instagram creator receives <strong style={{ color: 'var(--text-primary)' }}>47 DMs per day</strong>. 
                Most go unanswered for hours — or forever.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Each missed message is a customer who moved on, a collaboration that died, 
                a fan who felt ignored. It&apos;s not that you don&apos;t care — you&apos;re just buried.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>DMPilot catches what you can&apos;t.</strong> It responds while you create, 
                sleeps when you sleep, and never lets a conversation slip through.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              {[
                { value: '45%', label: 'DMs go unanswered' },
                { value: '3.2h', label: 'Avg response time' },
                { value: '67%', label: 'Lost conversions' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Phone Notifications */}
          <div className="relative">
            <div className="rounded-3xl p-6 border" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
              {/* Phone header */}
              <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--surface-2)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>9:41 AM</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Tuesday, May 5</span>
              </div>
              
              {/* Notifications */}
              <div className="space-y-3">
                {notifications.map((notif, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 border transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'var(--surface-1)',
                      borderColor: 'var(--surface-3)',
                      transitionDelay: `${i * 100}ms`,
                      transitionDuration: '500ms',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: notif.color }}>
                        {notif.app.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{notif.app}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{notif.time}</span>
                        </div>
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{notif.title}</div>
                        {notif.detail && (
                          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{notif.detail}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer badges */}
              <div className="flex justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--surface-2)' }}>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>+ 3 NEW</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>47 missed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 6. CostOfManual.tsx

```tsx
import { DayTimeline } from '../data-viz/DayTimeline';
import { StatCards } from '../data-viz/StatCards';
import { ExternalStats } from '../data-viz/ExternalStats';

export function CostOfManual() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            The Cost of Manual
          </h2>
          <p className="text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>
            Your 8 hours, on paper.
          </p>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            We tracked one creator&apos;s typical day, minute by minute. Here&apos;s where it actually went.
          </p>
        </div>

        <DayTimeline />
        <StatCards />
        <ExternalStats />

        <div className="text-center mt-16">
          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            It&apos;s not a willpower problem.
          </p>
          <p className="text-xl font-semibold" style={{ color: 'var(--text-muted)' }}>
            It&apos;s a tool problem.
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 7. WhatDMPilotDoes.tsx

```tsx
const pillars = [
  { number: 'I', title: 'DMs that don\'t slip.', desc: 'Capture from comments, stories, reels. One calm inbox.' },
  { number: 'II', title: 'AI that protects.', desc: 'Smart responses with full approval workflow. You stay in control.' },
  { number: 'III', title: 'Conversions that stay in view.', desc: 'Track every conversation. Today feeds tomorrow\'s insights.' },
  { number: 'IV', title: 'Calm by default.', desc: 'No spamming. No automation without consent. A quieter DM strategy, by design.' },
];

export function WhatDMPilotDoes() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>What DMPilot Does</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Quiet, on purpose.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Four pillars holding up the calm. Each one solves a piece of the manual chaos.
          </p>
        </div>

        <div className="space-y-12">
          {pillars.map((p, i) => (
            <div key={i} className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: 'var(--text-primary)' }}>
                {p.number}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Four columns under one roof.</p>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Quiet, on purpose.</p>
        </div>
      </div>
    </section>
  );
}
```

---

## 8. Solution.tsx

```tsx
'use client';

const features = [
  {
    icon: '🎯',
    title: 'Smart DM Responses',
    description: 'AI-powered responses that sound like you. Every reply is reviewed before sending — you always stay in control.',
    highlight: 'Contextual AI',
  },
  {
    icon: '⚡',
    title: 'Comment-to-DM Automation',
    description: 'Turn post comments into private conversations automatically. Capture leads the moment they engage with your content.',
    highlight: 'Auto-trigger',
  },
  {
    icon: '📊',
    title: 'Conversation Analytics',
    description: 'See which conversations convert, which messages resonate, and where leads drop off. Data-driven DM strategy.',
    highlight: 'Deep insights',
  },
  {
    icon: '🔄',
    title: 'Multi-Account Management',
    description: 'Manage DMs across multiple Instagram accounts from one calm dashboard. No more switching between apps.',
    highlight: 'One dashboard',
  },
  {
    icon: '🛡️',
    title: 'Human-in-the-Loop',
    description: 'Every automated response gets your approval first. No rogue messages, no awkward auto-replies. You\'re always the pilot.',
    highlight: 'Full control',
  },
  {
    icon: '🌙',
    title: 'Quiet Hours',
    description: 'Set business hours for automation. Outside those hours, DMs queue up peacefully. Your phone stays quiet.',
    highlight: 'Work-life balance',
  },
];

export function Solution() {
  return (
    <section id="solution" className="py-24 px-6" style={{ background: 'var(--surface-1)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>THE SOLUTION</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your DMs, on autopilot.
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Six features designed to make your Instagram DMs work for you, not against you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 border transition-all hover:shadow-lg"
              style={{
                background: 'var(--surface-0)',
                borderColor: 'var(--surface-3)',
              }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <div className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-3" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {feature.highlight}
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

All 8 files have been read and reported in full.

[MESSAGE FROM SUBAGENT 0f4242a5-ddf3-44aa-bf9e-bde004a62d59 (Section component researcher)]

Here are the full contents of all requested files:

---

## 1. DayInDMPilot.tsx

```tsx
const timeBlocks = [
  { type: 'RITUAL', time: '06:30', title: 'Morning ritual', desc: 'A 5-minute ritual lands you in your day before the world does.' },
  { type: 'DEEP', time: '09:00', title: 'Deep block', desc: 'Notifications off automatically. Instagram stays away. Plant grows on screen.' },
  { type: 'ADMIN', time: '11:15', title: 'Reply queue', desc: 'Triage in 90 seconds. Email + Instagram DMs.' },
  { type: 'REST', time: '13:00', title: 'Lunch', desc: 'Actual lunch. No notifications.' },
  { type: 'DEEP', time: '14:00', title: 'Deep block', desc: 'Content creation. Notifications off. Plant growing.' },
  { type: 'REVIEW', time: '16:15', title: 'Wins logged', desc: 'The day\'s done logs itself. You see what moved before you close.' },
  { type: 'CLOSE', time: '17:00', title: 'Close', desc: 'Tomorrow\'s three are already drafted. Inbox quiet. Laptop shut.' },
];

export function DayInDMPilot() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>A Day in DMPilot</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Tuesday, already calmer.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Three deep blocks. Two short rituals. One quiet day. Here&apos;s what a DMPilot day actually looks like.
          </p>
        </div>

        <div className="space-y-6">
          {timeBlocks.map((block, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-1)' }}>
              <div className="flex-shrink-0">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>{block.type}</span>
                <div className="text-sm font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{block.time}</div>
              </div>
              <div className="flex-shrink-0 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>·</div>
              <div>
                <h4 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{block.title}</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{block.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Six small moments.</p>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>One quiet day.</p>
        </div>
      </div>
    </section>
  );
}
```

---

## 2. Values.tsx

```tsx
const commitments = [
  { number: '01', title: 'Let you own everything.', desc: 'Export anytime. Delete anytime. We never sell your data, never read DMs for ads, never train AI on you without consent.' },
  { number: '02', title: 'Stay free at the core.', desc: 'When we open up, the basics stay free. There will be a Pro tier later for power features. Core is yours.' },
  { number: '03', title: 'Choose calm over clever.', desc: "We'd rather be quiet than viral. We'd rather you finish your day than open the app twelve times." },
  { number: '04', title: 'Build for creators, by creators.', desc: 'We understand your challenges because we face them too. Built by creators, for creators.' },
  { number: '05', title: 'Radical transparency.', desc: "We're upfront about what our AI can and cannot do. No hidden fees, no surprise limitations, complete clarity." },
];

export function Values() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Five Commitments
          </h2>
          <p className="text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>
            What we promise
          </p>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            These aren&apos;t marketing claims. They&apos;re the foundation of how we build DMPilot.
          </p>
        </div>

        <div className="space-y-10">
          {commitments.map((c, i) => (
            <div key={i} className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--text-primary)' }}>
                {c.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 3. TargetAudience.tsx

```tsx
const audiences = [
  {
    title: 'E-commerce Sellers',
    desc: 'Turn product inquiries into sales. Automatically respond to questions about sizing, availability, and shipping.',
    items: ['Product availability questions', 'Shipping and delivery inquiries', 'Size and fit questions', 'Custom order requests'],
  },
  {
    title: 'Course Creators',
    desc: 'Convert interested followers into students. Respond to course inquiries and provide enrollment information instantly.',
    items: ['Course curriculum questions', 'Pricing and discount inquiries', 'Enrollment assistance', 'Student support queries'],
  },
  {
    title: 'Service Providers',
    desc: 'Book more clients by responding to service inquiries quickly. Qualify leads and schedule consultations automatically.',
    items: ['Service package inquiries', 'Availability and booking', 'Pricing quote requests', 'Consultation scheduling'],
  },
  {
    title: 'Influencers & Creators',
    desc: 'Engage with your audience at scale. Respond to fan messages, partnership inquiries, and brand collaboration requests.',
    items: ['Fan engagement and DMs', 'Partnership inquiries', 'Brand collaboration requests', 'Content feedback and questions'],
  },
];

export function TargetAudience() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Built for You, If...</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            You&apos;re one of these
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Four types of creators who benefit from calm DM automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {audiences.map((a, i) => (
            <div key={i} className="p-8 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{a.desc}</p>
              <div className="space-y-2">
                {a.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 4. HonestComparison.tsx

```tsx
import { Comparison } from './Comparison';

export function HonestComparison() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-5xl mx-auto">
        <Comparison />
      </div>
    </section>
  );
}
```

---

## 5. Comparison.tsx

```tsx
'use client';

const competitors = [
  { name: 'ManyChat', x: 30, y: 25 },
  { name: 'Buffer', x: 75, y: 80 },
  { name: 'Hootsuite', x: 55, y: 55 },
];

const dmpilot = { name: 'DMPilot', x: 28, y: 48 };

const comparisons = [
  { name: 'ManyChat', desc: 'Great chatbot platform. We just added Instagram DM focus and personal touch.' },
  { name: 'Buffer', desc: 'Powerful social media management. DMPilot is opinionated about DMs — fewer features, more conversions.' },
  { name: 'Hootsuite', desc: 'Enterprise social suite. DMPilot is focused on creator DMs — simpler, more effective.' },
];

export function Comparison() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Honest Comparison</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Where each tool sits.
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Plotted by how much they hold and how loud they get. DMPilot lives in a different corner.
        </p>
      </div>

      {/* Chart */}
      <div className="relative mx-auto max-w-2xl aspect-square border rounded-2xl p-8" style={{ borderColor: 'var(--surface-3)' }}>
        {/* Axis labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-medium" style={{ color: 'var(--text-muted)', writingMode: 'vertical-lr' }}>CALM ↓</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>SINGLE-PURPOSE ← EVERYTHING IN ONE →</div>
        
        {/* Quadrant labels */}
        <div className="absolute top-6 left-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>BUSY · MAXIMAL</div>
        <div className="absolute top-6 right-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>BUSY · NICHE</div>
        <div className="absolute bottom-6 left-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>CALM · COMPLETE</div>
        <div className="absolute bottom-6 right-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>CALM · NICHE ★</div>

        {/* Competitors */}
        {competitors.map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
              {c.name}
            </div>
          </div>
        ))}

        {/* DMPilot */}
        <div
          className="absolute"
          style={{ left: `${dmpilot.x}%`, top: `${dmpilot.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: 'var(--text-primary)' }}>
            {dmpilot.name}
          </div>
          <div className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>← here</div>
        </div>
      </div>

      {/* Comparison text */}
      <div className="max-w-2xl mx-auto mt-12 space-y-4">
        {comparisons.map((c, i) => (
          <p key={i} className="text-base" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>. {c.desc}
          </p>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Not a replacement.</p>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>The calm wrapper around your DM strategy.</p>
      </div>
    </div>
  );
}
```

---

## 6. MeetsYouWhere.tsx

```tsx
import { Integrations } from './Integrations';

export function MeetsYouWhere() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--surface-1)' }}>
      <div className="max-w-5xl mx-auto">
        <Integrations />
      </div>
    </section>
  );
}
```

---

## 7. Integrations.tsx

```tsx
const integrations = [
  { name: 'DMPilot', desc: '', color: '#1a1b2e' },
  { name: 'Instagram', desc: 'DMs & Comments', color: '#E1306C' },
  { name: 'Slack', desc: 'Team notifications', color: '#4A154B' },
  { name: 'Gmail', desc: 'Email sync', color: '#EA4335' },
  { name: 'Notion', desc: 'Task tracking', color: '#000000' },
  { name: 'Mobile', desc: 'On the go', color: '#34A853' },
  { name: 'Web & Mac', desc: 'Desktop app', color: '#5B5FC7' },
];

export function Integrations() {
  return (
    <div>
      <div className="text-center mb-16">
        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Meets You Where You Work</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Six lines. One station.
        </h2>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Wherever a DM starts, it ends up at DMPilot Central.
        </p>
      </div>

      {/* Transit header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
          <span>DMPilot TRANSIT · LIVE</span>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>All lines running</span>
        </div>
      </div>

      {/* Integration lines */}
      <div className="max-w-2xl mx-auto space-y-3">
        {integrations.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--surface-0)' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
            {item.desc && (
              <>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Six places it can come from.</p>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>One inbox it lands in.</p>
      </div>
    </div>
  );
}
```

---

## 8. SocialProof.tsx

```tsx
const testimonials = [
  { initial: 'S', name: 'Sarah Chen', handle: '@sarahcreates', role: 'E-commerce Creator', quote: 'First week with DMPilot: shipped 3 products, missed zero DMs, closed the laptop at 6. I hadn\'t done that in two years.' },
  { initial: 'D', name: 'Devon Park', handle: '@devonp', role: 'Business Coach', quote: 'Replaced manual DMs, my response templates, and the spreadsheet I was using to track conversations. One tab.' },
  { initial: 'M', name: 'Maya Reyes', handle: '@maya_writes', role: 'Writer & parent', quote: 'Voice capture between drop-off and coffee. The DMs actually showed up later. Magical.' },
  { initial: 'R', name: 'Rohan Iyer', handle: '@rohaniyer', role: 'PM at series-B', quote: 'Instagram went quiet for the first time since onboarding.' },
  { initial: 'L', name: 'Lina Sato', handle: '@lina.sato', role: 'Indie illustrator', quote: 'I forgot what "feeling done" felt like. DMPilot gave it back, on a Tuesday.' },
];

export function SocialProof() {
  return (
    <section id="stories" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>From the Calm Crew</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Already in beta
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Five creators who finished their day feeling done.
          </p>
        </div>

        <div className="space-y-8">
          {testimonials.map((t, i) => (
            <div key={i} className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: 'var(--text-primary)' }}>
                {t.initial}
              </div>
              <div>
                <p className="text-base mb-3" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>@</span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.handle}</span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 9. FAQ.tsx

```tsx
'use client';

import { useState } from 'react';

const faqs = [
  { q: 'How does DMPilot work?', a: 'DMPilot connects to your Instagram account and monitors comments and DMs. When someone engages, our AI generates a personalized response based on your brand voice and rules. You review and approve before it sends — or set trusted responses to auto-send.' },
  { q: 'Will my followers know the responses are automated?', a: 'No. DMPilot crafts responses that match your unique voice and style. Each message feels personal because it\'s based on context — the comment, the user\'s history, and your brand guidelines. Nobody can tell.' },
  { q: 'Is my data secure?', a: 'Yes. We use bank-level encryption, never store your Instagram password, and comply with Instagram\'s official API policies. Your DM data is encrypted at rest and in transit. We never sell or share your data.' },
  { q: 'Can I customize the AI responses?', a: 'Absolutely. You set the tone, style, and rules. Want formal? Casual? Emoji-heavy? You train DMPilot on your voice, set custom rules per topic, and always have final approval before messages send.' },
  { q: 'What if I need help setting up?', a: 'We offer guided onboarding with real humans. Our team walks you through connecting your account, setting up your first automation rules, and crafting your brand voice. Most creators are fully set up in under 15 minutes.' },
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime with one click. No contracts, no cancellation fees, no guilt trips. We believe you should stay because DMPilot works, not because you\'re locked in.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Chat header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--text-primary)' }}>D</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>DMPilot</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Online · Usually replies instantly</div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Ask away.
          </h2>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Common questions</p>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Honest answers, no marketing-speak.
          </p>
        </div>

        <div className="space-y-3" role="region" aria-label="Frequently asked questions">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-4 rounded-xl text-base font-medium transition-colors"
                aria-expanded={openIndex === i}
                style={{
                  background: openIndex === i ? 'var(--surface-2)' : 'var(--surface-1)',
                  color: 'var(--text-primary)',
                }}
              >
                {faq.q}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 pt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Still have questions?{' '}
            <a href="mailto:support@dmpilot.com" className="underline" style={{ color: 'var(--text-secondary)' }}>
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 10. FinalCTA.tsx

```tsx
'use client';

import { useState } from 'react';

export function FinalCTA() {
  const [email, setEmail] = useState('');

  return (
    <section id="join" className="py-24 px-6" style={{ background: 'var(--surface-1)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: 'var(--text-muted)' }}>START YOUR DAY</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          When the day starts quiet, the day ends done.
        </h2>
        <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>Hi friend,</p>
        <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
          Most apps want you to do more. <strong style={{ color: 'var(--text-primary)' }}>DMPilot wants you to feel done.</strong>
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Drop your email. We&apos;ll send a thoughtful invite when there&apos;s room — never a marketing blast, never a countdown.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 px-5 py-3.5 rounded-xl text-base"
            style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)' }}
          />
          <button type="submit" className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--text-primary)' }}>
            Start your day
          </button>
        </form>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>With calm,</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>— The DMPilot team</p>

        <div className="mt-12 text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          JOIN THE CALM CREW · ALREADY IN BETA · QUIET ON PURPOSE
        </div>
      </div>
    </section>
  );
}
```

---

## 11. Footer.tsx

```tsx
export function Footer() {
  return (
    <footer className="py-16 px-6 border-t" style={{ borderColor: 'var(--surface-3)', background: 'var(--surface-0)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Goodnight. Sleep well.</p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>— The DMPilot team</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} DMPilot. All rights reserved.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Made with care for creators</p>
      </div>
    </footer>
  );
}
```

---

## 12. ProductDemo.tsx

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';

const demoConversation = {
  post: {
    username: 'yourstore',
    content: '🔥 New Summer Collection just dropped! Comment "STYLE" to get early access pricing →',
    likes: '2,847',
    comments: '342',
  },
  comments: [
    { username: 'sarah_style', text: 'STYLE', time: '2m' },
    { username: 'fashion_lover23', text: 'STYLE please! 🙏', time: '3m' },
    { username: 'mike_designer', text: 'STYLE', time: '5m' },
  ],
  dmFlow: [
    {
      type: 'trigger' as const,
      text: 'Comment detected: "STYLE" from @sarah_style',
      time: '0s',
    },
    {
      type: 'ai' as const,
      text: "Hey Sarah! 👋 Thanks for your interest in the Summer Collection! Here's your exclusive early access link with 20% off: shop.link/summer-vip\n\nThe collection drops publicly tomorrow, but you get first pick! Any questions about sizing or styles? I'm here to help 😊",
      time: '1s',
    },
    {
      type: 'user' as const,
      text: "Omg yes! Do you have the linen set in petite?",
      time: '2m',
    },
    {
      type: 'ai' as const,
      text: "Great taste! Yes, the Linen Breeze Set comes in petite (XS-M). Here's the direct link: shop.link/linen-petite\n\nPro tip: Petite sizes are selling fast — only 12 left! Want me to hold one for you? 🌿",
      time: '2m',
    },
  ],
};

export function ProductDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < demoConversation.dmFlow.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section ref={sectionRef} id="demo" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            SEE IT IN ACTION
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            From comment to customer in 60 seconds
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Watch how DMPilot turns a simple comment into a personalized conversation — automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: Instagram Post */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--surface-2)' }}>
              <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{demoConversation.post.username}</span>
            </div>
            <div className="p-6" style={{ background: 'var(--surface-1)' }}>
              <div className="h-48 rounded-xl flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                🛍️
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>{demoConversation.post.content}</p>
              <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>❤️ {demoConversation.post.likes}</span>
                <span>💬 {demoConversation.post.comments}</span>
              </div>
              <div className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--surface-2)' }}>
                {demoConversation.comments.map((c, i) => (
                  <div key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>@{c.username}</strong> {c.text}
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{c.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: DM Flow */}
          <div className="rounded-2xl border p-6 flex flex-col" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <div className="flex items-center gap-2 mb-6 pb-3 border-b" style={{ borderColor: 'var(--surface-2)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--text-primary)' }}>D</div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>DMPilot Flow</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Live</span>
            </div>
            
            <div className="flex-1 space-y-4 overflow-hidden">
              {demoConversation.dmFlow.map((msg, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 ${i <= currentStep && isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  {msg.type === 'trigger' && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        ⚡ {msg.text}
                      </span>
                    </div>
                  )}
                  {msg.type === 'ai' && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs" style={{ background: 'var(--text-primary)' }}>🤖</div>
                      <div className="rounded-2xl rounded-tl-sm p-3 text-sm max-w-[85%]" style={{ background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
                        {msg.text.split('\n').map((line, j) => (
                          <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.type === 'user' && (
                    <div className="flex gap-2 justify-end">
                      <div className="rounded-2xl rounded-tr-sm p-3 text-sm max-w-[85%] text-white" style={{ background: '#E1306C' }}>
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

All 12 files have been read and reported in full.

[MESSAGE FROM SUBAGENT 02909b59-3ed7-4e08-9131-b2ce9b70299b (Shared and visual component researcher)]

Here are the full contents of all requested files:

---

## 1. Files in `src/components/landing/shared/`

### Navigation.tsx (already covered)
### SideNavigation.tsx (already covered)

### EmailCapture.tsx
```tsx
'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function EmailCapture({ variant = 'default', className = '' }: EmailCaptureProps) {
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

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
          className="flex-1 px-4 py-2 rounded-lg text-sm border" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)', color: 'var(--text-primary)' }} />
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--text-primary)' }}>
          {status === 'loading' ? '...' : 'Join'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required
          className="flex-1 px-5 py-3.5 rounded-xl text-base" style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', color: 'var(--text-primary)' }} />
        <button type="submit" disabled={status === 'loading'} className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: 'var(--text-primary)' }}>
          {status === 'loading' ? 'Joining...' : 'Start your day'}
        </button>
      </div>
      {status === 'success' && <p className="text-sm text-green-600 text-center mt-3">Welcome! Check your email.</p>}
      {status === 'error' && <p className="text-sm text-red-500 text-center mt-3">Something went wrong. Try again?</p>}
    </form>
  );
}
```

---

## 2. Files in `src/components/landing/visual-storytelling/`

### NotificationStack.tsx
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const notifications = [
  { app: 'SLACK', time: 'now', title: 'Sarah Chen · #project-alpha' },
  { app: 'CALENDAR', time: '1m', title: 'URGENT · Standup added' },
  { app: 'GMAIL', time: '3m', title: '47 new emails' },
  { app: 'WHATSAPP', time: '14m', title: 'Mom' },
  { app: 'REMINDERS', time: '1h', title: 'Submit Q1 review' },
];

export function NotificationStack() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-md mx-auto">
      <div className="rounded-3xl p-6 border" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>9:41 AM</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Tuesday, May 5</span>
        </div>

        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 border transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)', transitionDelay: `${i * 150}ms`, transitionDuration: '500ms' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.app.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{n.app}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>+ 3 NEW</span>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>47 missed</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Files in `src/components/landing/data-viz/`

### DayTimeline.tsx
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const timeBlocks = [
  { start: '9 AM', label: 'Settle in', duration: '15m', color: '#fecaca', textColor: '#dc2626' },
  { start: '9:15 AM', label: 'Focus', duration: '20m', color: '#bfdbfe', textColor: '#2563eb' },
  { start: '9:35 AM', label: 'Slack ping', duration: '4m', color: '#fde68a', textColor: '#d97706' },
  { start: '9:39 AM', label: 'Refocus', duration: '17m', color: '#fecaca', textColor: '#dc2626' },
  { start: '9:56 AM', label: 'Focus', duration: '28m', color: '#bfdbfe', textColor: '#2563eb' },
  { start: '10:24 AM', label: 'Email check', duration: '6m', color: '#bbf7d0', textColor: '#16a34a' },
  { start: '10:30 AM', label: 'Refocus', duration: '12m', color: '#fecaca', textColor: '#dc2626' },
  { start: '10:42 AM', label: 'Focus', duration: '18m', color: '#bfdbfe', textColor: '#2563eb' },
  { start: '11:00 AM', label: 'Standup', duration: '30m', color: '#e9d5ff', textColor: '#7c3aed' },
  { start: '11:30 AM', label: 'Coffee', duration: '5m', color: '#e5e7eb', textColor: '#6b7280' },
  { start: '11:35 AM', label: 'Focus', duration: '25m', color: '#bfdbfe', textColor: '#2563eb' },
  { start: '12:00 PM', label: 'Lunch', duration: '45m', color: '#e5e7eb', textColor: '#6b7280' },
];

const timeHeaders = ['9 AM', '10', '11', '12', '1 PM'];

export function DayTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mb-12">
      {/* Time headers */}
      <div className="flex justify-between mb-4 px-2">
        {timeHeaders.map((t, i) => (
          <span key={i} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t}</span>
        ))}
      </div>

      {/* Timeline blocks */}
      <div className="space-y-2">
        {timeBlocks.map((block, i) => (
          <div
            key={i}
            className={`flex items-center rounded-lg px-4 py-2.5 transition-all ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            style={{
              background: block.color,
              transitionDelay: `${i * 80}ms`,
              transitionDuration: '500ms',
            }}
          >
            <span className="text-xs font-mono w-20 flex-shrink-0" style={{ color: block.textColor }}>{block.start}</span>
            <span className="text-sm font-medium flex-1" style={{ color: block.textColor }}>{block.label}</span>
            <span className="text-xs font-medium" style={{ color: block.textColor }}>{block.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### StatCards.tsx
```tsx
const stats = [
  { value: '2h 36m', label: 'ACTUAL FOCUS', detail: '33% of the day' },
  { value: '2h', label: 'MEETINGS', detail: '25% of the day' },
  { value: '1h 7m', label: 'SLACK + EMAIL', detail: '14% of the day' },
  { value: '47m', label: 'LOST TO REFOCUS', detail: '10% of the day' },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((s, i) => (
        <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-1)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
          <div className="text-xs font-medium tracking-wider uppercase mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.detail}</div>
        </div>
      ))}
    </div>
  );
}
```

### ExternalStats.tsx
```tsx
const externalStats = [
  { value: '1,200', label: 'APP SWITCHES / DAY', source: 'Instagram, 2024' },
  { value: '23 min', label: 'TO REFOCUS', source: 'UC Irvine' },
  { value: '67%', label: 'BURNT OUT BY FRIDAY', source: 'Gallup, 2024' },
  { value: '45%', label: 'DMs GO UNANSWERED', source: 'Our data' },
];

export function ExternalStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {externalStats.map((s, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
          <div className="text-xs font-medium tracking-wider uppercase mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>{s.source}</div>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. globals.css (already provided above)

## 5. layout.tsx
```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "DMPilot - AI-Powered Instagram DM Automation",
  description: "Automate your Instagram DMs with AI-powered responses. Turn comments into customers, save 10+ hours per week, and never miss a lead.",
  metadataBase: new URL('https://dmpilot.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
```

## 6. package.json
```json
{
  "name": "dmpilot",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch --passWithNoTests",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "next": "15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/jest": "^29.5.14",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

All files have been read and reported.

