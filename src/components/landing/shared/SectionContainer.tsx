'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: 'default' | 'light' | 'dark' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const variants = {
  default: 'section-neutral',
  light: 'section-warm',
  dark: 'dark',
  gradient: 'section-neutral',
};

const paddings = {
  sm: 'py-10 md:py-14',
  md: 'py-14 md:py-20',
  lg: 'py-16 md:py-24',
  xl: 'py-16 md:py-24',
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
      style={{ background: variant === 'default' || variant === 'gradient' ? 'var(--surface-1)' : variant === 'light' ? 'var(--surface-0)' : undefined }}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth])}>
        {children}
      </div>
    </section>
  );
}
