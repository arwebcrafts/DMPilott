# Phase 3: Hero Section Redesign

## Overview

Redesign the hero section to match mursa.me's calm, minimalist approach with a single CTA, refined messaging, and minimal visual elements.

## Objectives

1. Simplify hero to single CTA (email capture)
2. Change badge to match calm theme
3. Rewrite headline to be more reflective
4. Remove dashboard preview
5. Make design more minimal and focused
6. Add subtle background pattern

## Current State

**DMPilot Hero:**
- Badge: "Now in Beta - Join 500+ Creators"
- Headline: "Turn Comments into Customers"
- Subheadline: "Automate your Instagram DM responses without losing the personal touch..."
- Two CTAs: "Start Free Trial" + "Watch Demo"
- Dashboard preview screenshot
- Statistics cards below
- More complex, feature-heavy

## Target State

**New Hero:**
- Badge: "CALM ENGAGEMENT · PRIVATE BETA"
- Headline: "End the day knowing you actually connected."
- Subheadline: "A calm DM automation tool that helps you respond without losing the personal touch."
- Single CTA: Email capture with "Start your day"
- No dashboard preview
- Minimal, focused design
- Subtle background pattern

## Implementation Steps

### Step 1: Create New Hero Component

**File**: `src/components/landing/sections/Hero.tsx`

**Complete Rewrite**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { EmailCapture } from '@/components/landing/shared/EmailCapture';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          CALM ENGAGEMENT · PRIVATE BETA
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
        >
          End the day knowing you actually connected.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
        >
          A calm DM automation tool that helps you respond without losing the personal touch.
        </motion.p>

        {/* Email Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <EmailCapture
            placeholder="Your email"
            buttonText="Start your day"
            className="w-full"
          />
          <p className="mt-4 text-sm text-gray-500">
            Join the calm crew already in beta. No spam.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

### Step 2: Update EmailCapture Component

**File**: `src/components/landing/shared/EmailCapture.tsx`

**Changes**:
```typescript
// Simplify design for hero use
export function EmailCapture({ 
  placeholder = "Your email",
  buttonText = "Start your day",
  className = "",
  onSubmit 
}: EmailCaptureProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <input
        type="email"
        placeholder={placeholder}
        className="flex-1 px-5 py-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 outline-none text-gray-900 placeholder-gray-400"
        required
      />
      <button
        type="submit"
        className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
      >
        {buttonText}
      </button>
    </div>
  );
}
```

### Step 3: Remove Dashboard Preview

**File**: `src/components/landing/sections/Hero.tsx`

**Action**: Remove the dashboard preview section completely.

### Step 4: Remove Statistics Cards from Hero

**File**: `src/components/landing/sections/Hero.tsx`

**Action**: Remove statistics cards from hero. They will be moved to a later section.

### Step 5: Add Subtle Background Pattern

**File**: `src/app/globals.css`

**Add**:
```css
/* Subtle dot pattern for hero */
.hero-pattern {
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
}

/* Or subtle gradient */
.hero-gradient {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
}
```

**Apply to Hero**:
```typescript
<section className="min-h-screen flex items-center justify-center bg-white hero-gradient px-4">
```

### Step 6: Update Page Integration

**File**: `src/app/page.tsx`

**Changes**:
```typescript
// Remove old hero imports
// Import new hero
import { Hero } from '@/components/landing/sections/Hero';

// Update page structure
<main className="light-theme">
  <Navigation />
  <Hero />
  {/* Other sections */}
</main>
```

### Step 7: Remove Secondary CTA Section

**File**: `src/app/page.tsx`

**Action**: Remove any secondary CTA section that was below the hero.

### Step 8: Test Hero Section

**Actions**:
- Test on mobile
- Test on desktop
- Test email capture functionality
- Check responsiveness
- Verify animations
- Test in both light and dark modes

## File Checklist

- [ ] `src/components/landing/sections/Hero.tsx` - Complete rewrite
- [ ] `src/components/landing/shared/EmailCapture.tsx` - Simplify design
- [ ] `src/app/globals.css` - Add background pattern
- [ ] `src/app/page.tsx` - Update integration
- [ ] Remove dashboard preview
- [ ] Remove statistics from hero
- [ ] Test on mobile
- [ ] Test on desktop
- [ ] Test email capture
- [ ] Test animations

## Success Criteria

- [ ] Hero has single CTA (email capture)
- [ ] Badge matches calm theme
- [ ] Headline is reflective and calm
- [ ] No dashboard preview
- [ ] Design is minimal and focused
- [ ] Subtle background pattern
- [ ] Responsive on all devices
- [ ] Email capture works
- [ ] Animations are smooth
- [ ] Build passes without errors

## Estimated Time

- **Hero Component Rewrite**: 2 hours
- **EmailCapture Update**: 1 hour
- **Background Pattern**: 0.5 hours
- **Page Integration**: 0.5 hours
- **Testing & Refinement**: 1 hour
- **Total**: 5 hours

## Dependencies

- Should be done after Phase 1 (Theme & Colors)
- Should be done after Phase 2 (Typography)
- Should be done before Phase 4 (Visual Storytelling)

## Notes

- Keep the messaging calm and reflective
- Ensure email capture is prominent
- Test the form submission
- Consider adding a subtle animation
- Keep the design minimal
- Remove all unnecessary elements

## Copy Guidelines

**Badge**: "CALM ENGAGEMENT · PRIVATE BETA"
**Headline**: "End the day knowing you actually connected."
**Subheadline**: "A calm DM automation tool that helps you respond without losing the personal touch."
**CTA Button**: "Start your day"
**Helper Text**: "Join the calm crew already in beta. No spam."

---

**Phase**: 3 of 6
**Priority**: High
**Timeline**: Week 1
