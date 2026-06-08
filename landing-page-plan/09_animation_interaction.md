# DMPilot Landing Page Implementation Plan
## Part 9: Animation & Interaction Design

---

## Table of Contents
- [Animation Philosophy](#animation-philosophy)
- [Framer Motion Setup](#framer-motion-setup)
- [Animation Patterns](#animation-patterns)
- [Scroll Animations](#scroll-animations)
- [Hover Interactions](#hover-interactions)
- [Micro-Interactions](#micro-interactions)
- [Performance Considerations](#performance-considerations)
- [Accessibility](#accessibility)

---

## Animation Philosophy

### Core Principles

1. **Purposeful Animation**: Every animation should serve a clear purpose (guide attention, provide feedback, tell a story)
2. **Subtle & Smooth**: Animations should be subtle, not distracting
3. **Performance First**: Animations must not impact page performance
4. **Respect Preferences**: Honor user's motion preferences
5. **Progressive Enhancement**: Animations enhance, not replace, functionality

### Animation Goals

- **Guide Attention**: Draw attention to important elements (CTAs, key information)
- **Provide Feedback**: Confirm user actions (button clicks, form submissions)
- **Create Flow**: Smooth transitions between sections and states
- **Build Engagement**: Make the experience feel alive and responsive
- **Tell Stories**: Use animation to illustrate concepts (product demo, data visualization)

---

## Framer Motion Setup

### Installation

```bash
npm install framer-motion
```

### Basic Setup

```typescript
'use client';

import { motion } from 'framer-motion';

export function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

### Configuration

```typescript
// Create reusable animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};
```

---

## Animation Patterns

### 1. Staggered Children

Animate children in sequence for a cascading effect.

```typescript
'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="p-4 bg-white rounded-lg shadow-sm"
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 2. Scroll-Triggered Animations

Animate elements when they enter the viewport.

```typescript
'use client';

import { motion } from 'framer-motion';

export function ScrollAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      Content that animates on scroll
    </motion.div>
  );
}
```

### 3. Hover Effects

Animate elements on user hover.

```typescript
'use client';

import { motion } from 'framer-motion';

export function HoverCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      Card content
    </motion.div>
  );
}
```

### 4. Layout Animations

Animate layout changes smoothly.

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function Accordion({ items }: { items: { title: string; content: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            {item.title}
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
```

---

## Scroll Animations

### Section Entry Animations

Each section should animate in when it enters the viewport.

```typescript
'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from './SectionContainer';

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <SectionContainer>
        {children}
      </SectionContainer>
    </motion.section>
  );
}
```

### Progress Indicator

Show scroll progress with a progress bar.

```typescript
'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
}
```

### Parallax Effects

Create depth with parallax scrolling.

```typescript
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <section ref={ref} className="relative h-screen">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image src="/images/parallax.jpg" alt="Parallax" fill />
      </motion.div>
    </section>
  );
}
```

---

## Hover Interactions

### Button Hover Effects

```typescript
'use client';

import { motion } from 'framer-motion';

export function AnimatedButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {children}
    </motion.button>
  );
}
```

### Card Hover Effects

```typescript
'use client';

import { motion } from 'framer-motion';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      {children}
    </motion.div>
  );
}
```

### Icon Hover Effects

```typescript
'use client';

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

export function AnimatedIcon({ icon: Icon }: { icon: Icon }) {
  return (
    <motion.div
      whileHover={{ rotate: 15, scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="h-6 w-6" />
    </motion.div>
  );
}
```

---

## Micro-Interactions

### Loading States

```typescript
'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingButton({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      disabled={isLoading}
      whileHover={!isLoading ? { scale: 1.05 } : {}}
      whileTap={!isLoading ? { scale: 0.95 } : {}}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-5 w-5" />
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
}
```

### Success/Error States

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function StatusMessage({ status, message }: { status: 'success' | 'error'; message: string }) {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'flex items-center gap-2 p-4 rounded-lg',
            status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}
        >
          {status === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Form Focus Effects

```typescript
'use client';

import { motion } from 'framer-motion';

export function AnimatedInput() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <motion.input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        animate={{
          borderColor: isFocused ? '#3b82f6' : '#d1d5db',
          boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        }}
        transition={{ duration: 0.2 }}
        className="w-full px-4 py-3 rounded-lg border-2 outline-none"
      />
    </div>
  );
}
```

---

## Performance Considerations

### Reduce Motion

Respect user's motion preferences.

```typescript
'use client';

import { motion } from 'framer-motion';

export function RespectfulAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Disable animation for users who prefer reduced motion
      whileTap={false}
      whileHover={false}
    >
      {children}
    </motion.div>
  );
}
```

### GPU Acceleration

Use transforms for better performance.

```typescript
// Good - GPU accelerated
<motion.div animate={{ x: 100 }} />

// Avoid - CPU intensive
<motion.div animate={{ left: 100 }} />
```

### Lazy Loading Animations

Load animation libraries only when needed.

```typescript
import dynamic from 'next/dynamic';

const AnimatedComponent = dynamic(
  () => import('./AnimatedComponent'),
  { ssr: false }
);
```

### Animation Cleanup

Clean up animations when components unmount.

```typescript
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function CleanAnimation() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1 });
    
    return () => {
      controls.stop();
    };
  }, [controls]);

  return <motion.div animate={controls} />;
}
```

---

## Accessibility

### Reduced Motion Support

```typescript
'use client';

import { motion } from 'framer-motion';

export function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Respect prefers-reduced-motion
      className="motion-reduce:transition-none motion-reduce:transform-none"
    >
      {children}
    </motion.div>
  );
}
```

### Focus Indicators

Maintain focus visibility during animations.

```typescript
'use client';

import { motion } from 'framer-motion';

export function FocusableButton() {
  return (
    <motion.button
      whileFocus={{ scale: 1.05 }}
      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Button
    </motion.button>
  );
}
```

### ARIA Labels

Add ARIA labels for animated elements.

```typescript
'use client';

import { motion } from 'framer-motion';

export function AnimatedProgress({ value }: { value: number }) {
  return (
    <motion.div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      animate={{ width: `${value}%` }}
      className="h-2 bg-blue-600 rounded-full"
    />
  );
}
```

---

## Animation Library

### Reusable Animation Components

```typescript
// src/components/animations/FadeIn.tsx
'use client';

import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.5, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// src/components/animations/SlideUp.tsx
'use client';

import { motion } from 'framer-motion';

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, duration = 0.5, className }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// src/components/animations/ScaleIn.tsx
'use client';

import { motion } from 'framer-motion';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Custom Hooks

```typescript
// src/hooks/useScrollAnimation.ts
'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return { ref, isInView, hasAnimated };
}
```

---

## Animation Best Practices

### Do's

1. **Use meaningful animations** that enhance user experience
2. **Keep animations short** (200-500ms for most interactions)
3. **Use easing functions** for natural motion
4. **Test on lower-end devices** for performance
5. **Provide visual feedback** for all interactions
6. **Respect user preferences** for reduced motion

### Don'ts

1. **Don't over-animate** - less is more
2. **Don't use animations that cause motion sickness**
3. **Don't animate large areas** unnecessarily
4. **Don't block user interactions** during animations
5. **Don't use animations that distract from content**
6. **Don't ignore performance** implications

---

## Section-Specific Animations

### Hero Section

```typescript
// Staggered entrance for hero elements
const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
```

### Product Demo

```typescript
// Continuous subtle animation for demo elements
const floatingVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

### Statistics

```typescript
// Animated counter for statistics
const counterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
};
```

### Testimonials

```typescript
// Fade in testimonials with stagger
const testimonialVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
};
```
