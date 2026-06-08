# DMPilot Landing Page Implementation Plan
## Part 3: Component Structure

---

## Table of Contents
- [Component Overview](#component-overview)
- [Shared Components](#shared-components)
- [Section Components](#section-components)
- [Data Visualization Components](#data-visualization-components)
- [Component Props Interfaces](#component-props-interfaces)
- [Component Composition Patterns](#component-composition-patterns)

---

## Component Overview

### Component Categories

1. **Shared Components**: Reusable components used across multiple sections
2. **Section Components**: Major landing page sections
3. **Data Visualization Components**: Charts and data displays
4. **UI Components**: Radix UI primitives and custom UI elements

### Component Decision Tree

```
Is the component used in multiple sections?
├─ Yes → Shared Component
└─ No → Section Component

Does the component need interactivity?
├─ Yes → Client Component ('use client')
└─ No → Server Component (default)

Does the component display data visualizations?
├─ Yes → Data Visualization Component
└─ No → Standard Component
```

---

## Shared Components

### SectionContainer.tsx

**Purpose**: Wraps all sections with consistent spacing, padding, and background styling.

**Props Interface**:
```typescript
interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: 'default' | 'light' | 'dark' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-white',
  light: 'bg-gray-50',
  dark: 'bg-gray-900',
  gradient: 'bg-gradient-to-b from-gray-50 to-white',
};

const paddings = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  xl: 'py-24 md:py-40',
};

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function SectionContainer({
  children,
  id,
  className,
  variant = 'default',
  padding = 'lg',
  maxWidth = 'xl',
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        variants[variant],
        paddings[padding],
        'w-full',
        className
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth])}>
        {children}
      </div>
    </section>
  );
}
```

---

### SectionHeader.tsx

**Purpose**: Standardized header component for section titles, subtitles, and descriptions.

**Props Interface**:
```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const sizes = {
  sm: {
    title: 'text-2xl md:text-3xl',
    subtitle: 'text-lg',
  },
  md: {
    title: 'text-3xl md:text-4xl',
    subtitle: 'text-xl',
  },
  lg: {
    title: 'text-4xl md:text-5xl',
    subtitle: 'text-2xl',
  },
  xl: {
    title: 'text-5xl md:text-6xl',
    subtitle: 'text-3xl',
  },
};

const alignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function SectionHeader({
  title,
  subtitle,
  description,
  align = 'center',
  size = 'lg',
  badge,
  className,
}: SectionHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className={cn(alignments[align], 'mb-12 md:mb-16', className)}
    >
      {badge && (
        <motion.div
          variants={itemVariants}
          className="inline-block mb-4"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        </motion.div>
      )}
      
      <motion.h2
        variants={itemVariants}
        className={cn(
          sizes[size].title,
          'font-bold text-gray-900 tracking-tight',
          align === 'center' && 'mx-auto max-w-3xl'
        )}
      >
        {title}
      </motion.h2>
      
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={cn(
            sizes[size].subtitle,
            'mt-4 text-gray-600',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
        >
          {subtitle}
        </motion.p>
      )}
      
      {description && (
        <motion.p
          variants={itemVariants}
          className={cn(
            'mt-4 text-lg text-gray-500 leading-relaxed',
            align === 'center' && 'mx-auto max-w-3xl'
          )}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
```

---

### CTAButton.tsx

**Purpose**: Reusable call-to-action button with variants and loading states.

**Props Interface**:
```typescript
interface CTAButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50',
  ghost: 'text-gray-900 hover:bg-gray-100',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function CTAButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  href,
  className,
}: CTAButtonProps) {
  const button = (
    <Button
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        variants[variant],
        sizes[size],
        'font-semibold rounded-lg transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );

  if (href) {
    return <a href={href}>{button}</a>;
  }

  return button;
}
```

---

### EmailCapture.tsx

**Purpose**: Email capture form with validation and submission handling.

**Props Interface**:
```typescript
interface EmailCaptureProps {
  onSubmit: (email: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { cn } from '@/lib/utils';

export function EmailCapture({
  onSubmit,
  placeholder = 'Enter your email',
  buttonText = 'Get Started',
  successMessage = "You're on the list!",
  className,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting || isSuccess}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          />
        </div>
        <CTAButton
          type="submit"
          isLoading={isSubmitting}
          disabled={isSuccess}
          className="sm:w-auto"
        >
          {buttonText}
        </CTAButton>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-red-600 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-green-600 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
```

---

### StatCard.tsx

**Purpose**: Display statistics with icon, value, and label.

**Props Interface**:
```typescript
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  value,
  label,
  icon,
  description,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-gray-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-blue-600">{icon}</div>
      )}
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {trend && trendValue && (
          <div className="flex items-center gap-1 text-sm">
            {trendIcons[trend]}
            <span className={cn(
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      
      <p className="mt-2 text-lg font-medium text-gray-700">{label}</p>
      
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </motion.div>
  );
}
```

---

### FeatureCard.tsx

**Purpose**: Display features with icon, title, and description.

**Props Interface**:
```typescript
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        'hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      <div className="mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
```

---

### TestimonialCard.tsx

**Purpose**: Display user testimonials with avatar, name, and quote.

**Props Interface**:
```typescript
interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        className
      )}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      <blockquote className="text-gray-700 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          {role && <p className="text-sm text-gray-500">{role}</p>}
        </div>
      </div>
    </motion.div>
  );
}
```

---

### IntegrationCard.tsx

**Purpose**: Display integration logos with hover effects.

**Props Interface**:
```typescript
interface IntegrationCardProps {
  name: string;
  logo: string;
  description?: string;
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IntegrationCard({
  name,
  logo,
  description,
  className,
}: IntegrationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        'hover:shadow-lg transition-all duration-200',
        'flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <img
        src={logo}
        alt={name}
        className="w-16 h-16 object-contain mb-4"
      />
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <ExternalLink className="mt-3 h-4 w-4 text-gray-400" />
    </motion.div>
  );
}
```

---

## Section Components

### Component List

1. **Hero.tsx** - Main hero section with headline, subheadline, and CTAs
2. **Problem.tsx** - Problem statement with pain points
3. **DataVisualization.tsx** - Data-driven credibility section
4. **Solution.tsx** - Solution overview and benefits
5. **ProductDemo.tsx** - Interactive product demonstration
6. **TargetAudience.tsx** - Target audience description
7. **Values.tsx** - Company values and principles
8. **Comparison.tsx** - Feature comparison with competitors
9. **Integrations.tsx** - Integration showcase
10. **SocialProof.tsx** - Testimonials and case studies
11. **FAQ.tsx** - Frequently asked questions
12. **FinalCTA.tsx** - Final call-to-action section
13. **Footer.tsx** - Footer with links and information

Each section component will use the shared components (SectionContainer, SectionHeader, etc.) to maintain consistency.

---

## Data Visualization Components

### TimelineChart.tsx

**Purpose**: Display timeline data showing response time improvements.

**Props Interface**:
```typescript
interface TimelineChartProps {
  data: {
    label: string;
    before: number;
    after: number;
  }[];
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function TimelineChart({ data, className }: TimelineChartProps) {
  return (
    <div className={cn('w-full h-80', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="before" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Before DMPilot"
            dot={{ fill: '#ef4444' }}
          />
          <Line 
            type="monotone" 
            dataKey="after" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="With DMPilot"
            dot={{ fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### PositioningMatrix.tsx

**Purpose**: Display positioning matrix comparing DMPilot with competitors.

**Props Interface**:
```typescript
interface PositioningMatrixProps {
  competitors: {
    name: string;
    x: number;
    y: number;
    color: string;
  }[];
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function PositioningMatrix({ competitors, className }: PositioningMatrixProps) {
  return (
    <div className={cn('w-full h-96', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Ease of Use"
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Features"
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          {competitors.map((competitor) => (
            <Scatter
              key={competitor.name}
              name={competitor.name}
              data={[competitor]}
              fill={competitor.color}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### ConversionFunnel.tsx

**Purpose**: Display conversion funnel showing the journey from comment to customer.

**Props Interface**:
```typescript
interface ConversionFunnelProps {
  data: {
    stage: string;
    value: number;
    color: string;
  }[];
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function ConversionFunnel({ data, className }: ConversionFunnelProps) {
  return (
    <div className={cn('w-full h-80', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            type="category"
            dataKey="stage"
            stroke="#6b7280"
            fontSize={12}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <defs key={index}>
                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                </linearGradient>
              </defs>
            ))}
            {data.map((entry, index) => (
              <rect key={index} fill={`url(#gradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### IntegrationMap.tsx

**Purpose**: Visual representation of integrations and connections.

**Props Interface**:
```typescript
interface IntegrationMapProps {
  integrations: {
    name: string;
    category: string;
    icon: string;
  }[];
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function IntegrationMap({ integrations, className }: IntegrationMapProps) {
  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {categories.map((category) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="space-y-3">
            {integrations
              .filter(i => i.category === category)
              .map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                >
                  <img
                    src={integration.icon}
                    alt={integration.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {integration.name}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

---

### StatisticDisplay.tsx

**Purpose**: Display key statistics with animated counters.

**Props Interface**:
```typescript
interface StatisticDisplayProps {
  statistics: {
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
  }[];
  className?: string;
}
```

**Implementation**:
```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatisticDisplay({ statistics, className }: StatisticDisplayProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-8', className)}>
      {statistics.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </div>
          <p className="text-gray-600">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
```

---

## Component Props Interfaces

### Complete Type Definitions

```typescript
// src/types/landing.ts

export interface HeroData {
  headline: string;
  subheadline: string;
  description?: string;
  cta: {
    primary: string;
    secondary: string;
  };
  image?: string;
}

export interface ProblemData {
  statistics: {
    value: string;
    label: string;
    source?: string;
  }[];
  painPoints: string[];
}

export interface SolutionData {
  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface ComparisonData {
  features: {
    name: string;
    dmpilot: boolean | string;
    competitor: boolean | string;
  }[];
}

export interface TestimonialData {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

export interface FAQData {
  question: string;
  answer: string;
  category?: string;
}

export interface IntegrationData {
  name: string;
  logo: string;
  description?: string;
  category: string;
}
```

---

## Component Composition Patterns

### Pattern 1: Section Wrapper
```typescript
<SectionContainer variant="light" padding="lg">
  <SectionHeader
    title="Section Title"
    subtitle="Section Subtitle"
    description="Section description"
  />
  {/* Section content */}
</SectionContainer>
```

### Pattern 2: Grid Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <FeatureCard
      key={item.id}
      icon={item.icon}
      title={item.title}
      description={item.description}
    />
  ))}
</div>
```

### Pattern 3: Animation Wrapper
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

### Pattern 4: Responsive Image
```typescript
<Image
  src={imageSrc}
  alt={imageAlt}
  width={1200}
  height={800}
  className="rounded-xl shadow-lg"
  priority={isAboveFold}
/>
```
