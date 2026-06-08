# Phase 1: Theme & Colors Implementation

## Overview

Transform DMPilot from a dark, blue-themed SaaS landing page to a light, calm, minimalist design inspired by mursa.me.

## Objectives

1. Switch to light theme by default
2. Replace blue primary with subtle accent color
3. Use white/gray palette with minimal color
4. Add dark mode toggle
5. Remove gradient elements
6. Create calm, professional color scheme

## Current State

**DMPilot Colors:**
- Primary: Blue (#2563eb)
- Background: Dark (#07070d)
- Text: Light (#f0f0f5)
- Gradients: Orange, pink, purple
- Theme: Dark by default

## Target State

**New Color Palette:**
- Primary: Subtle accent (slate/gray)
- Background: White (#ffffff)
- Text: Dark gray (#111827)
- Secondary: Light gray (#f3f4f6)
- Accent: Minimal (subtle blue or purple)
- Theme: Light by default with dark mode toggle

## Implementation Steps

### Step 1: Update CSS Variables

**File**: `src/app/globals.css`

**Changes**:
```css
/* Remove current dark theme variables */
/* Add new light theme variables */

:root {
  /* Light theme (default) */
  --background: #ffffff;
  --foreground: #111827;
  --surface-0: #ffffff;
  --surface-1: #f9fafb;
  --surface-2: #f3f4f6;
  --surface-3: #e5e7eb;
  --surface-4: #d1d5db;
  
  /* Text colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* Accent colors (minimal) */
  --accent: #6366f1; /* Subtle indigo */
  --accent-light: #e0e7ff;
  
  /* Remove gradients */
  /* Use solid colors instead */
}

/* Dark theme (via class) */
.dark {
  --background: #0a0a0f;
  --foreground: #f0f0f5;
  --surface-0: #07070d;
  --surface-1: #0d0d15;
  --surface-2: #13131f;
  --surface-3: #1a1a2e;
  --surface-4: #22223a;
  
  --text-primary: #f0f0f5;
  --text-secondary: #8a8a9a;
  --text-muted: #5a5a6e;
}
```

### Step 2: Update Light Theme Class

**File**: `src/app/globals.css`

**Changes**:
```css
/* Update .light-theme to be default */
.light-theme {
  /* Make this the default styling */
  --surface-0: #ffffff;
  --surface-1: #f9fafb;
  --surface-2: #f3f4f6;
  --surface-3: #e5e7eb;
  --surface-4: #d1d5db;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-bg-hover: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(0, 0, 0, 0.1);
  --glass-border-hover: rgba(0, 0, 0, 0.15);
  --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
```

### Step 3: Remove Gradient Elements

**Files to Update**:
- `src/app/globals.css`
- `src/components/landing/shared/CTAButton.tsx`
- Any component using gradients

**Changes**:
```css
/* Remove gradient animations */
/* Remove gradient text classes */
/* Remove gradient border classes */
/* Replace with solid colors */

/* Old */
.gradient-text {
  background: linear-gradient(135deg, var(--brand-orange), var(--brand-pink), var(--brand-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* New */
.accent-text {
  color: var(--accent);
}
```

### Step 4: Update Component Colors

**Files to Update**:
- `src/components/landing/shared/CTAButton.tsx`
- `src/components/landing/shared/SectionHeader.tsx`
- `src/components/landing/shared/StatCard.tsx`
- All section components

**CTAButton Changes**:
```typescript
// Old variants
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50',
  ghost: 'text-gray-900 hover:bg-gray-100',
};

// New variants
const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  outline: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
};
```

### Step 5: Add Dark Mode Toggle

**File**: `src/components/landing/shared/Navigation.tsx`

**Implementation**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    
    // Apply class
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

**Add to Navigation**:
```typescript
import { DarkModeToggle } from './DarkModeToggle';

// In Navigation component
<DarkModeToggle />
```

### Step 6: Update Background Patterns

**File**: `src/app/globals.css`

**Changes**:
```css
/* Remove colorful gradient backgrounds */
/* Add subtle, minimal backgrounds */

.hero-bg {
  background: #ffffff;
  /* Or very subtle gradient */
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
}

/* Remove hero-bg with colorful gradients */
/* Use clean, solid backgrounds */
```

### Step 7: Update Section Backgrounds

**Files to Update**:
- All section components
- `src/app/globals.css`

**Changes**:
```css
/* Remove colorful section backgrounds */
/* Use alternating white/gray sections */

.section-light {
  background: #ffffff;
}

.section-gray {
  background: #f9fafb;
}
```

### Step 8: Test Color Contrast

**Action**:
- Run accessibility audit
- Check WCAG AA compliance
- Ensure text is readable on all backgrounds
- Test in both light and dark modes

## File Checklist

- [ ] `src/app/globals.css` - Update CSS variables
- [ ] `src/app/globals.css` - Remove gradients
- [ ] `src/app/globals.css` - Update backgrounds
- [ ] `src/components/landing/shared/CTAButton.tsx` - Update colors
- [ ] `src/components/landing/shared/SectionHeader.tsx` - Update colors
- [ ] `src/components/landing/shared/StatCard.tsx` - Update colors
- [ ] `src/components/landing/shared/Navigation.tsx` - Add dark mode toggle
- [ ] `src/components/landing/shared/DarkModeToggle.tsx` - Create new component
- [ ] All section components - Update colors
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Accessibility audit

## Success Criteria

- [ ] Light theme is default
- [ ] Dark mode toggle works
- [ ] No gradient elements
- [ ] Color palette is minimal and calm
- [ ] WCAG AA contrast ratio met
- [ ] All components updated
- [ ] Build passes without errors

## Estimated Time

- **CSS Variables Update**: 1 hour
- **Component Color Updates**: 2 hours
- **Dark Mode Toggle**: 1 hour
- **Testing & Refinement**: 1 hour
- **Total**: 5 hours

## Dependencies

- None - can be done independently
- Should be done before Phase 2 (Typography)

## Notes

- Keep backup of current colors
- Test thoroughly in both modes
- Ensure smooth transition
- Consider using CSS custom properties for easier theming

---

**Phase**: 1 of 6
**Priority**: High
**Timeline**: Week 1
