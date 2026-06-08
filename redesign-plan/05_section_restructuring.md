# Phase 5: Section Restructuring

## Overview

Restructure the landing page sections to match mursa.me's narrative flow and add new sections for better visual storytelling.

## Objectives

1. Add "Sound familiar?" section with notifications
2. Add "The cost of manual" timeline section
3. Restructure features to numbered pillars (I, II, III, IV)
4. Add "A day in DMPilot" timeline section
5. Change testimonials to letter-based format
6. Update comparison section with positioning matrix
7. Add transit line integrations section

## Current Section Order

1. Hero
2. Problem
3. Solution
4. Product Demo
5. Target Audience
6. Values
7. Comparison
8. Integrations
9. Social Proof
10. FAQ
11. Final CTA
12. Footer

## New Section Order

1. Hero (simplified)
2. Sound Familiar? (NEW - notification visualization)
3. The Cost of Manual (NEW - timeline visualization)
4. What DMPilot Does (restructured - numbered pillars)
5. A Day in DMPilot (NEW - timeline visualization)
6. Built for You, If... (target audience)
7. Honest Comparison (with positioning matrix)
8. Meets You Where You Work (transit lines)
9. From the Calm Crew (letter-based testimonials)
10. FAQ
11. Final CTA (personalized)
12. Footer

## Implementation Steps

### Step 1: Create "Sound Familiar?" Section

**File**: `src/components/landing/sections/SoundFamiliar.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { NotificationVisualization } from '@/components/landing/visual-storytelling/NotificationVisualization';

export function SoundFamiliar() {
  return (
    <SectionContainer padding="xl" id="sound-familiar" className="bg-gray-50">
      <SectionHeader
        title="Sound familiar?"
        subtitle="Your Instagram, right now."
        description="Eight things demanding your attention before you've had coffee. Nobody's lazy. Nobody's broken. We're just buried under everyone else's urgency."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <NotificationVisualization />
      </div>
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <p className="text-lg text-gray-600">
          If you've ever wondered about the <span className="font-semibold">47 DMs pending meaning</span> on your Instagram, the answer is simple — that's your brain's 47 tabs open, made visible. It's the difference between busy-ness and being productive: <span className="font-semibold">busy looks like motion. Productivity looks like quiet, finished things.</span>
        </p>
        <p className="mt-4 text-gray-500">
          DMPilot starts the day <span className="font-semibold">before</span> this does.
        </p>
      </div>
    </SectionContainer>
  );
}
```

### Step 2: Create "The Cost of Manual" Section

**File**: `src/components/landing/sections/CostOfManual.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { TimelineVisualization } from '@/components/landing/visual-storytelling/TimelineVisualization';

export function CostOfManual() {
  return (
    <SectionContainer padding="xl" id="cost-of-manual">
      <SectionHeader
        title="The Cost of Manual"
        subtitle="Your 8 hours, on paper."
        description="We tracked one creator's typical day, minute by minute. Here's where it actually went."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <TimelineVisualization />
      </div>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-gray-900">1,200</div>
          <div className="text-sm text-gray-600">APP SWITCHES / DAY</div>
          <div className="text-xs text-gray-400 mt-1">Instagram, 2024</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">23 min</div>
          <div className="text-sm text-gray-600">TO REFOCUS</div>
          <div className="text-xs text-gray-400 mt-1">UC Irvine</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">67%</div>
          <div className="text-sm text-gray-600">BURNT OUT BY FRIDAY</div>
          <div className="text-xs text-gray-400 mt-1">Gallup, 2024</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">45%</div>
          <div className="text-sm text-gray-600">DMs GO UNANSWERED</div>
          <div className="text-xs text-gray-400 mt-1">Our data</div>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-xl font-medium text-gray-900">It's not a willpower problem.</p>
        <p className="text-gray-600">It's a tool problem.</p>
      </div>
    </SectionContainer>
  );
}
```

### Step 3: Restructure "What DMPilot Does" Section

**File**: `src/components/landing/sections/WhatDMPilotDoes.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';

const pillars = [
  {
    number: 'I',
    title: 'DMs that don\'t slip.',
    description: 'Capture from comments, stories, reels. One calm inbox.',
  },
  {
    number: 'II',
    title: 'AI that protects.',
    description: 'Smart responses with full approval workflow. You stay in control.',
  },
  {
    number: 'III',
    title: 'Conversions that stay in view.',
    description: 'Track every conversation. Today feeds tomorrow\'s insights.',
  },
  {
    number: 'IV',
    title: 'Calm by default.',
    description: 'No spamming. No automation without consent. A quieter DM strategy, by design.',
  },
];

export function WhatDMPilotDoes() {
  return (
    <SectionContainer padding="xl" id="what-dmpilot-does" className="bg-gray-50">
      <SectionHeader
        title="What DMPilot Does"
        subtitle="Quiet, on purpose."
        description="Four pillars holding up the calm. Each one solves a piece of the manual chaos."
        align="center"
        size="lg"
      />
      <div className="mt-16 max-w-4xl mx-auto">
        {pillars.map((pillar, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-8 items-start mb-12 last:mb-0"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {pillar.number}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-gray-600">{pillar.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-600">Four columns under one roof.</p>
        <p className="text-gray-500">Quiet, on purpose.</p>
      </div>
    </SectionContainer>
  );
}
```

### Step 4: Create "A Day in DMPilot" Section

**File**: `src/components/landing/sections/DayInDMPilot.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';

const dayEvents = [
  { time: '06:30', type: 'RITUAL', title: 'Morning ritual', description: 'A 5-minute ritual lands you in your day before the world does.' },
  { time: '09:00', type: 'DEEP', title: 'Deep block', description: 'Notifications off automatically. Instagram stays away. Plant grows on screen.' },
  { time: '11:15', type: 'ADMIN', title: 'Reply queue', description: 'Triage in 90 seconds. Email + Instagram DMs.' },
  { time: '13:00', type: 'REST', title: 'Lunch', description: 'Actual lunch. No notifications.' },
  { time: '14:00', type: 'DEEP', title: 'Deep block', description: 'Content creation. Notifications off. Plant growing.' },
  { time: '16:15', type: 'REVIEW', title: 'Wins logged', description: 'The day\'s done logs itself. You see what moved before you close.' },
  { time: '17:00', type: 'CLOSE', title: 'Close', description: 'Tomorrow\'s three are already drafted. Inbox quiet. Laptop shut.' },
];

const typeColors = {
  RITUAL: 'bg-purple-100 text-purple-700',
  DEEP: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-orange-100 text-orange-700',
  REST: 'bg-green-100 text-green-700',
  REVIEW: 'bg-pink-100 text-pink-700',
  CLOSE: 'bg-gray-100 text-gray-700',
};

export function DayInDMPilot() {
  return (
    <SectionContainer padding="xl" id="day-in-dmpilot">
      <SectionHeader
        title="A Day in DMPilot"
        subtitle="Your Tuesday, already calmer."
        description="Three deep blocks. Two short rituals. One quiet day. Here's what a DMPilot day actually looks like."
        align="center"
        size="lg"
      />
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="space-y-4">
          {dayEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                {event.type}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{event.time}</span>
                  <span className="text-gray-600">·</span>
                  <span className="font-medium text-gray-900">{event.title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-gray-900">Six small moments.</p>
          <p className="text-gray-600">One quiet day.</p>
        </div>
      </div>
    </SectionContainer>
  );
}
```

### Step 5: Update "Built for You" Section

**File**: `src/components/landing/sections/TargetAudience.tsx`

**Changes**: Keep existing but simplify design to match new aesthetic.

### Step 6: Create "Honest Comparison" Section

**File**: `src/components/landing/sections/HonestComparison.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { PositioningMatrix } from '@/components/landing/visual-storytelling/PositioningMatrix';

export function HonestComparison() {
  return (
    <SectionContainer padding="xl" id="honest-comparison" className="bg-gray-50">
      <SectionHeader
        title="Honest Comparison"
        subtitle="Where each tool sits."
        description="Plotted by how much they hold and how loud they get. DMPilot lives in a different corner."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <PositioningMatrix />
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg font-medium text-gray-900">Not a replacement.</p>
        <p className="text-gray-600">The calm wrapper around your DM strategy.</p>
      </div>
    </SectionContainer>
  );
}
```

### Step 7: Create "Meets You Where You Work" Section

**File**: `src/components/landing/sections/MeetsYouWhere.tsx`

**Implementation**:
```typescript
'use client';

import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { TransitDiagram } from '@/components/landing/visual-storytelling/TransitDiagram';

export function MeetsYouWhere() {
  return (
    <SectionContainer padding="xl" id="meets-you-where">
      <SectionHeader
        title="Meets You Where You Work"
        subtitle="Six lines. One station."
        description="Wherever a DM starts, it ends up at DMPilot Central."
        align="center"
        size="lg"
      />
      <div className="mt-12">
        <TransitDiagram />
      </div>
    </SectionContainer>
  );
}
```

### Step 8: Update Testimonials to Letter-Based

**File**: `src/components/landing/sections/SocialProof.tsx`

**Changes**:
```typescript
const testimonials = [
  {
    letter: 'S',
    name: 'Sarah Chen',
    handle: '@sarahbuilds',
    role: 'Solo SaaS founder',
    quote: 'First week with DMPilot: shipped 3 features, missed zero DMs, closed the laptop at 6. I hadn\'t done that in two years.',
  },
  {
    letter: 'D',
    name: 'Devon Park',
    handle: '@devonp',
    role: 'Design lead',
    quote: 'Replaced manual DMs, my response templates, and the spreadsheet I was using to track conversations. One tab.',
  },
  {
    letter: 'M',
    name: 'Maya Reyes',
    handle: '@maya_writes',
    role: 'Writer & parent',
    quote: 'Voice capture between drop-off and coffee. The DMs actually showed up later. Magical.',
  },
  {
    letter: 'R',
    name: 'Rohan Iyer',
    handle: '@rohaniyer',
    role: 'PM at series-B',
    quote: 'Instagram went quiet for the first time since onboarding.',
  },
  {
    letter: 'L',
    name: 'Lina Sato',
    handle: '@lina.sato',
    role: 'Indie illustrator',
    quote: 'I forgot what "feeling done" felt like. DMPilot gave it back, on a Tuesday.',
  },
];

// Render as letter-based cards
<div className="space-y-8">
  {testimonials.map((testimonial) => (
    <div key={testimonial.letter} className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
        {testimonial.letter}
      </div>
      <div className="flex-1">
        <p className="text-lg text-gray-900 mb-4">"{testimonial.quote}"</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{testimonial.name}</span>
          <span className="text-gray-400">@</span>
          <span className="text-gray-600">{testimonial.handle}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{testimonial.role}</span>
        </div>
      </div>
    </div>
  ))}
</div>
```

### Step 9: Update Page Section Order

**File**: `src/app/page.tsx`

**Changes**:
```typescript
import { Hero } from '@/components/landing/sections/Hero';
import { SoundFamiliar } from '@/components/landing/sections/SoundFamiliar';
import { CostOfManual } from '@/components/landing/sections/CostOfManual';
import { WhatDMPilotDoes } from '@/components/landing/sections/WhatDMPilotDoes';
import { DayInDMPilot } from '@/components/landing/sections/DayInDMPilot';
import { TargetAudience } from '@/components/landing/sections/TargetAudience';
import { HonestComparison } from '@/components/landing/sections/HonestComparison';
import { MeetsYouWhere } from '@/components/landing/sections/MeetsYouWhere';
import { SocialProof } from '@/components/landing/sections/SocialProof';
import { FAQ } from '@/components/landing/sections/FAQ';
import { FinalCTA } from '@/components/landing/sections/FinalCTA';
import { Footer } from '@/components/landing/sections/Footer';

// New order
<main className="light-theme">
  <Navigation />
  <Hero />
  <SoundFamiliar />
  <CostOfManual />
  <WhatDMPilotDoes />
  <DayInDMPilot />
  <TargetAudience />
  <HonestComparison />
  <MeetsYouWhere />
  <SocialProof />
  <FAQ />
  <FinalCTA />
  <Footer />
</main>
```

### Step 10: Remove Old Sections

**Files to Remove**:
- `src/components/landing/sections/Problem.tsx` (replaced by SoundFamiliar + CostOfManual)
- `src/components/landing/sections/Solution.tsx` (replaced by WhatDMPilotDoes)
- `src/components/landing/sections/ProductDemo.tsx` (removed)
- `src/components/landing/sections/Values.tsx` (integrated into WhatDMPilotDoes)
- `src/components/landing/sections/Comparison.tsx` (replaced by HonestComparison)
- `src/components/landing/sections/Integrations.tsx` (replaced by MeetsYouWhere)

## File Checklist

- [ ] `src/components/landing/sections/SoundFamiliar.tsx` - Create
- [ ] `src/components/landing/sections/CostOfManual.tsx` - Create
- [ ] `src/components/landing/sections/WhatDMPilotDoes.tsx` - Create
- [ ] `src/components/landing/sections/DayInDMPilot.tsx` - Create
- [ ] `src/components/landing/sections/HonestComparison.tsx` - Create
- [ ] `src/components/landing/sections/MeetsYouWhere.tsx` - Create
- [ ] `src/components/landing/sections/TargetAudience.tsx` - Update
- [ ] `src/components/landing/sections/SocialProof.tsx` - Update to letter-based
- [ ] `src/app/page.tsx` - Update section order
- [ ] Remove old section files
- [ ] Test new section flow
- [ ] Test responsiveness

## Success Criteria

- [ ] All new sections created
- [ ] Section order matches mursa.me flow
- [ ] Testimonials are letter-based
- [ ] Numbered pillars implemented
- [ ] Visual storytelling integrated
- [ ] Old sections removed
- [ ] Build passes without errors

## Estimated Time

- **SoundFamiliar Section**: 2 hours
- **CostOfManual Section**: 2 hours
- **WhatDMPilotDoes Section**: 2 hours
- **DayInDMPilot Section**: 2 hours
- **HonestComparison Section**: 1 hour
- **MeetsYouWhere Section**: 1 hour
- **TargetAudience Update**: 1 hour
- **SocialProof Update**: 1 hour
- **Page Integration**: 1 hour
- **Testing & Refinement**: 2 hours
- **Total**: 15 hours

## Dependencies

- Should be done after Phase 4 (Visual Storytelling)
- Should be done before Phase 6 (Card & Navigation)

## Notes

- Maintain narrative flow
- Keep sections minimal
- Ensure smooth transitions
- Test section spacing
- Consider scroll depth
- Keep copy consistent with calm theme

---

**Phase**: 5 of 6
**Priority**: Medium
**Timeline**: Week 2-3
