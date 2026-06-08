# Phase 2: Typography Implementation

## Overview

Refine the typography system to match mursa.me's clean, readable, and hierarchical approach with larger headlines and generous spacing.

## Objectives

1. Increase headline sizes significantly
2. Improve line spacing for readability
3. Refine font weights for better hierarchy
4. Create better visual hierarchy between sections
5. Add more generous padding and margins

## Current State

**DMPilot Typography:**
- Font: Inter (body), Outfit (headings)
- H1: 3rem (48px)
- H2: 2.25rem (36px)
- H3: 1.75rem (28px)
- Body: 1rem (16px)
- Line height: 1.5-1.6
- Standard tech startup spacing

## Target State

**New Typography Scale:**
- Font: Inter (body), Inter (headings - more consistent)
- H1: 4.5rem (72px) - Much larger
- H2: 3rem (48px) - Larger
- H3: 2rem (32px) - Larger
- H4: 1.5rem (24px)
- Body: 1.125rem (18px) - Slightly larger
- Line height: 1.6-1.8 - More generous
- Generous section spacing

## Implementation Steps

### Step 1: Update Typography Scale

**File**: `src/app/globals.css`

**Changes**:
```css
:root {
  /* Typography scale */
  --font-xs: 0.75rem;    /* 12px */
  --font-sm: 0.875rem;   /* 14px */
  --font-base: 1.125rem; /* 18px - increased from 16px */
  --font-lg: 1.25rem;    /* 20px */
  --font-xl: 1.5rem;     /* 24px */
  --font-2xl: 2rem;      /* 32px */
  --font-3xl: 2.5rem;    /* 40px */
  --font-4xl: 3rem;      /* 48px */
  --font-5xl: 4.5rem;    /* 72px - new largest size */
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.6;
  --leading-relaxed: 1.8;
  --leading-loose: 2;
  
  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Step 2: Update Font Configuration

**File**: `src/app/layout.tsx`

**Changes**:
```typescript
// Use Inter for everything for consistency
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Remove Outfit, use Inter for all text
```

**CSS Update**:
```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif; /* Changed from Outfit */
}
```

### Step 3: Update Heading Styles

**File**: `src/app/globals.css`

**Changes**:
```css
h1 {
  font-size: var(--font-5xl);
  line-height: var(--leading-tight);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: var(--font-4xl);
  line-height: var(--leading-tight);
  font-weight: var(--font-semibold);
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
}

h3 {
  font-size: var(--font-2xl);
  line-height: var(--leading-normal);
  font-weight: var(--font-semibold);
  margin-bottom: 1rem;
}

h4 {
  font-size: var(--font-xl);
  line-height: var(--leading-normal);
  font-weight: var(--font-medium);
  margin-bottom: 0.75rem;
}

p {
  font-size: var(--font-base);
  line-height: var(--leading-relaxed);
  margin-bottom: 1rem;
  color: var(--text-secondary);
}
```

### Step 4: Update SectionHeader Component

**File**: `src/components/landing/shared/SectionHeader.tsx`

**Changes**:
```typescript
// Update size prop values
const sizes = {
  sm: 'text-2xl', // 24px
  md: 'text-3xl', // 36px
  lg: 'text-4xl', // 48px
  xl: 'text-5xl', // 60px - new
};

// Update default size
const defaultSize = 'lg'; // Changed from md

// Add more generous spacing
const spacing = {
  sm: 'mb-4',
  md: 'mb-6',
  lg: 'mb-8',
  xl: 'mb-12',
};
```

### Step 5: Update Section Spacing

**File**: `src/app/globals.css`

**Changes**:
```css
/* Increase section padding */
.section-padding-sm {
  padding: 4rem 1rem; /* 64px */
}

.section-padding-md {
  padding: 6rem 1rem; /* 96px */
}

.section-padding-lg {
  padding: 8rem 1rem; /* 128px */
}

.section-padding-xl {
  padding: 10rem 1rem; /* 160px */
}
```

**Update SectionContainer**:
```typescript
const paddings = {
  sm: 'py-16', // 64px
  md: 'py-24', // 96px
  lg: 'py-32', // 128px
  xl: 'py-40', // 160px - new
};
```

### Step 6: Update Hero Typography

**File**: `src/components/landing/sections/Hero.tsx`

**Changes**:
```typescript
// Much larger headline
<h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
  End the day knowing you actually connected.
</h1>

// Larger subheadline
<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
  A calm DM automation tool that helps you respond without losing the personal touch.
</p>
```

### Step 7: Update Component Typography

**Files to Update**:
- `src/components/landing/shared/StatCard.tsx`
- `src/components/landing/shared/FeatureCard.tsx`
- `src/components/landing/shared/TestimonialCard.tsx`
- All section components

**StatCard Example**:
```typescript
// Larger value
<h3 className="text-5xl md:text-6xl font-bold">
  {value}
</h3>

// Larger label
<p className="text-lg md:text-xl">
  {label}
</p>
```

### Step 8: Add Responsive Typography

**File**: `src/app/globals.css`

**Changes**:
```css
/* Responsive typography */
@media (max-width: 768px) {
  h1 {
    font-size: var(--font-4xl); /* 48px on mobile */
  }
  
  h2 {
    font-size: var(--font-3xl); /* 40px on mobile */
  }
  
  h3 {
    font-size: var(--font-xl); /* 24px on mobile */
  }
  
  p {
    font-size: var(--font-base); /* 18px on mobile */
  }
}
```

### Step 9: Update Line Heights

**File**: `src/app/globals.css`

**Changes**:
```css
/* More generous line heights for readability */
body {
  line-height: var(--leading-relaxed);
}

/* Tighter line heights for headings */
h1, h2, h3, h4, h5, h6 {
  line-height: var(--leading-tight);
}

/* Relaxed line heights for long text */
.long-text {
  line-height: var(--leading-loose);
}
```

### Step 10: Test Typography

**Actions**:
- Test on different screen sizes
- Check readability
- Verify hierarchy
- Ensure accessibility
- Test in both light and dark modes

## File Checklist

- [ ] `src/app/globals.css` - Update typography scale
- [ ] `src/app/globals.css` - Update heading styles
- [ ] `src/app/globals.css` - Update line heights
- [ ] `src/app/globals.css` - Add responsive typography
- [ ] `src/app/layout.tsx` - Update font configuration
- [ ] `src/components/landing/shared/SectionHeader.tsx` - Update sizes
- [ ] `src/components/landing/shared/SectionContainer.tsx` - Update padding
- [ ] `src/components/landing/sections/Hero.tsx` - Update typography
- [ ] `src/components/landing/shared/StatCard.tsx` - Update typography
- [ ] `src/components/landing/shared/FeatureCard.tsx` - Update typography
- [ ] `src/components/landing/shared/TestimonialCard.tsx` - Update typography
- [ ] All section components - Update typography
- [ ] Test on mobile
- [ ] Test on desktop
- [ ] Accessibility audit

## Success Criteria

- [ ] Headlines are significantly larger
- [ ] Line spacing is more generous
- [ ] Typography hierarchy is clear
- [ ] Text is highly readable
- [ ] Responsive typography works
- [ ] WCAG AA compliance met
- [ ] All components updated
- [ ] Build passes without errors

## Estimated Time

- **Typography Scale Update**: 1 hour
- **Component Updates**: 3 hours
- **Responsive Typography**: 1 hour
- **Testing & Refinement**: 1 hour
- **Total**: 6 hours

## Dependencies

- Should be done after Phase 1 (Theme & Colors)
- Should be done before Phase 3 (Hero Section)

## Notes

- Keep consistent with mursa.me's approach
- Test readability on all devices
- Ensure accessibility
- Consider using modular scale for consistency
- Maintain brand voice through typography

---

**Phase**: 2 of 6
**Priority**: High
**Timeline**: Week 1
