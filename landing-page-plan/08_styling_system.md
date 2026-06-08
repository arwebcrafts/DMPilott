# DMPilot Landing Page Implementation Plan
## Part 8: Styling System & Design Tokens

---

## Table of Contents
- [Design System Overview](#design-system-overview)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Shadows & Borders](#shadows--borders)
- [Border Radius](#border-radius)
- [Animation Tokens](#animation-tokens)
- [Component-Specific Styles](#component-specific-styles)

---

## Design System Overview

### Design Philosophy
The DMPilot landing page uses a calm, minimalist aesthetic inspired by mursa.me, with a focus on clarity, readability, and progressive disclosure. The design system is built on Tailwind CSS 4 with custom design tokens for consistency.

### Core Principles
1. **Consistency**: Reusable design tokens across all components
2. **Scalability**: Easy to extend and modify
3. **Accessibility**: WCAG AA compliant color contrast
4. **Performance**: Minimal CSS bundle size
5. **Maintainability**: Clear naming and organization

---

## Color Palette

### Primary Colors

```css
/* Blue - Primary Brand Color */
--color-blue-50: #eff6ff;
--color-blue-100: #dbeafe;
--color-blue-200: #bfdbfe;
--color-blue-300: #93c5fd;
--color-blue-400: #60a5fa;
--color-blue-500: #3b82f6;
--color-blue-600: #2563eb;  /* Primary */
--color-blue-700: #1d4ed8;
--color-blue-800: #1e40af;
--color-blue-900: #1e3a8a;
```

### Secondary Colors

```css
/* Purple - Accent Color */
--color-purple-50: #faf5ff;
--color-purple-100: #f3e8ff;
--color-purple-200: #e9d5ff;
--color-purple-300: #d8b4fe;
--color-purple-400: #c084fc;
--color-purple-500: #a855f7;
--color-purple-600: #9333ea;  /* Accent */
--color-purple-700: #7e22ce;
--color-purple-800: #6b21a8;
--color-purple-900: #581c87;
```

### Neutral Colors

```css
/* Gray - Text & Backgrounds */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### Semantic Colors

```css
/* Success */
--color-green-50: #f0fdf4;
--color-green-100: #dcfce7;
--color-green-500: #22c55e;
--color-green-600: #16a34a;

/* Warning */
--color-yellow-50: #fefce8;
--color-yellow-100: #fef9c3;
--color-yellow-500: #eab308;
--color-yellow-600: #ca8a04;

/* Error */
--color-red-50: #fef2f2;
--color-red-100: #fee2e2;
--color-red-500: #ef4444;
--color-red-600: #dc2626;
```

### Color Usage Guidelines

**Primary Colors (Blue)**
- CTAs (primary buttons)
- Links
- Active states
- Icons
- Accents

**Secondary Colors (Purple)**
- Gradients
- Special highlights
- Secondary accents
- Background variations

**Neutral Colors (Gray)**
- Text (gray-900, gray-700, gray-600, gray-500)
- Backgrounds (gray-50, gray-100)
- Borders (gray-200, gray-300)
- Disabled states

**Semantic Colors**
- Success: Confirmation messages, positive indicators
- Warning: Caution messages, pending states
- Error: Error messages, negative indicators

---

## Typography

### Font Families

```css
/* Primary Font - Inter */
--font-inter: 'Inter', system-ui, -apple-system, sans-serif;

/* Display Font - Outfit */
--font-outfit: 'Outfit', sans-serif;

/* Monospace Font - JetBrains Mono */
--font-mono: 'JetBrains Mono', monospace;
```

### Font Sizes

```css
/* Text Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Usage

**Headlines**
- Hero: text-5xl to text-7xl, font-bold, leading-tight
- Section Headers: text-3xl to text-5xl, font-bold, leading-tight
- Subheaders: text-xl to text-2xl, font-semibold, leading-snug

**Body Text**
- Primary: text-base, font-normal, leading-relaxed
- Secondary: text-sm, font-normal, leading-relaxed
- Captions: text-xs, font-normal, leading-normal

**UI Elements**
- Buttons: text-base to text-lg, font-semibold
- Labels: text-sm, font-medium
- Links: text-sm, font-medium

---

## Spacing

### Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Spacing Usage

**Component Padding**
- Cards: p-4 to p-6
- Buttons: px-4 py-2 to px-8 py-4
- Inputs: px-4 py-3
- Sections: py-12 to py-32

**Component Margins**
- Between cards: gap-4 to gap-6
- Between sections: py-16 to py-24
- Between elements: space-y-4 to space-y-8

**Container Padding**
- Mobile: px-4
- Tablet: px-6
- Desktop: px-8

---

## Shadows & Borders

### Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Shadow Usage

- **Cards**: shadow-sm to shadow-md
- **Hover States**: shadow-lg
- **Modals**: shadow-xl
- **Hero Image**: shadow-2xl

### Borders

```css
/* Border Widths */
--border-0: 0;
--border: 1px;
--border-2: 2px;
--border-4: 4px;
--border-8: 8px;

/* Border Colors */
--border-gray-100: #f3f4f6;
--border-gray-200: #e5e7eb;
--border-gray-300: #d1d5db;
--border-blue-200: #bfdbfe;
--border-blue-500: #3b82f6;
```

### Border Usage

- **Cards**: border border-gray-100 or border-gray-200
- **Inputs**: border border-gray-300
- **Buttons**: border-2 for outline variant
- **Dividers**: border-b border-gray-200

---

## Border Radius

### Radius Scale

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius: 0.25rem;      /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### Radius Usage

- **Buttons**: rounded-lg
- **Cards**: rounded-xl
- **Inputs**: rounded-lg
- **Badges**: rounded-full
- **Avatars**: rounded-full
- **Hero Image**: rounded-2xl

---

## Animation Tokens

### Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Usage

- **Hover Effects**: duration-200, ease-out
- **Page Transitions**: duration-300, ease-in-out
- **Scroll Animations**: duration-500, ease-out
- **Complex Animations**: duration-700, ease-in-out

---

## Component-Specific Styles

### Button Styles

```css
/* Primary Button */
.btn-primary {
  @apply bg-blue-600 text-white font-semibold rounded-lg;
  @apply px-6 py-3 transition-all duration-200;
  @apply hover:bg-blue-700 active:scale-95;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-900 text-white font-semibold rounded-lg;
  @apply px-6 py-3 transition-all duration-200;
  @apply hover:bg-gray-800 active:scale-95;
}

/* Outline Button */
.btn-outline {
  @apply border-2 border-gray-900 text-gray-900 font-semibold rounded-lg;
  @apply px-6 py-3 transition-all duration-200;
  @apply hover:bg-gray-50 active:scale-95;
}
```

### Card Styles

```css
/* Base Card */
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100;
  @apply transition-shadow duration-200;
}

/* Card Hover */
.card-hover {
  @apply hover:shadow-lg hover:-translate-y-1;
}

/* Feature Card */
.feature-card {
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-100;
  @apply hover:shadow-lg transition-all duration-200;
}
```

### Input Styles

```css
/* Base Input */
.input {
  @apply w-full px-4 py-3 rounded-lg border border-gray-300;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply transition-all duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Input Error */
.input-error {
  @apply border-red-500 focus:ring-red-500;
}
```

### Section Styles

```css
/* Section Container */
.section {
  @apply w-full py-16 md:py-24;
}

/* Section Light */
.section-light {
  @apply bg-gray-50;
}

/* Section Dark */
.section-dark {
  @apply bg-gray-900 text-white;
}

/* Section Gradient */
.section-gradient {
  @apply bg-gradient-to-b from-gray-50 to-white;
}
```

---

## Tailwind Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Global Styles

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
    --font-outfit: 'Outfit', sans-serif;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply font-sans antialiased;
    font-family: var(--font-inter);
  }
}

@layer components {
  /* Custom component styles here */
}

@layer utilities {
  /* Custom utility classes here */
}
```

---

## Accessibility Considerations

### Color Contrast
- All text must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Use tools like WebAIM Contrast Checker to verify
- Primary blue-600 on white: 7.5:1 (passes)
- Gray-500 on white: 4.6:1 (passes)

### Focus States
- All interactive elements must have visible focus states
- Use `focus:ring-2 focus:ring-blue-500` for consistent focus indication
- Focus ring must be at least 2px wide

### Touch Targets
- Minimum touch target size: 44x44px
- Buttons and links should have adequate padding
- Ensure spacing between interactive elements

### Reduced Motion
- Respect `prefers-reduced-motion` media query
- Provide non-animated alternatives
- Use `motion-reduce` variant in Tailwind

---

## Responsive Design Tokens

### Breakpoints

```css
/* Tailwind Default Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Typography

```css
/* Mobile First Approach */
.text-responsive {
  @apply text-lg md:text-xl lg:text-2xl;
}

.text-headline {
  @apply text-3xl md:text-4xl lg:text-5xl;
}
```

### Responsive Spacing

```css
.padding-responsive {
  @apply py-12 md:py-16 lg:py-24;
}

.gap-responsive {
  @apply gap-4 md:gap-6 lg:gap-8;
}
```
